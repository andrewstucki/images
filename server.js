require('dotenv').load();

var server = require('http').createServer();
var util = require('util');
var path = require('path');

var promise = require('promise');
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var _ = require('lodash');
var hat = require('hat');
var WebSocketServer = require('websocket').server;
var validator = require('validator');

// Errors

var NotFound = function(message) {
  Error.call(this);
  this.message = message;
};
NotFound.prototype.toString = function(){
  return this.message;
};
util.inherits(NotFound, Error);

var ModelInvalid = function(message) {
  Error.call(this);
  this.message = message;
};
ModelInvalid.prototype.toString = function(){
  return this.message;
};
util.inherits(ModelInvalid, Error);

var DatabaseFailure = function(message) {
  Error.call(this);
  this.message = message;
};
DatabaseFailure.prototype.toString = function(){
  return this.message;
};
util.inherits(DatabaseFailure, Error);

var Unauthorized = function(message) {
  Error.call(this);
  this.message = message;
};
Unauthorized.prototype.toString = function(){
  return this.message;
};
util.inherits(Unauthorized, Error);

// Setup
var config = {
  redis: process.env.REDIS_URL || "redis://localhost:6379",
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY,
    secret: process.env.TWITTER_CONSUMER_SECRET
  },
  baseUrl: process.env.BASE_URL || "http://localhost:4000",
  mongo: process.env.MONGOLAB_URI || "mongodb://localhost/images",
  port: process.env.PORT || 4000,
  secret: process.env.SESSION_SECRET || 'fqsIrsdKuT5YX7JKgV8576eFWh28KUnmCahxOlUL1hLiWiJlJRlagXGBGb-tPxhoj4HkIOu4AsOulf0'
}

mongoose.Promise = promise;
mongoose.connect(config.mongo);
// Models

var imageValidators = {
  url: function(url) {
    return {
      valid: validator.isURL(url),
      message: "Invalid url."
    }
  }
};

var imageValidation = function(fields) {
  var urlValidation;

  if (fields.url) urlValidation = imageValidators.url(fields.url);

  var errors = []
  if (urlValidation && !urlValidation.valid) errors.push(urlValidation.message);

  return errors;
};

var imageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: String
});

imageSchema.methods.renderJson = function(user) {
  var payload = {
    id: this._id,
    url: this.url,
    title: this.title,
    createdAt: this._id.getTimestamp()
  };
  if (user) payload.user = user;
  return payload;
};

var userSchema = new mongoose.Schema({
  twitterId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  token: { type: String, required: true },
  secret: { type: String, required: true },
  images: [ imageSchema ]
});

userSchema.statics.upsert = function (key, options) {
  var self = this;
  return new promise(function(resolve, reject) {
    var callback = function(err, info) {
      if (err) return reject(err);
      if (!info.lastErrorObject.updatedExisting) {
        broadcastUserAdd({
          id: info.lastErrorObject.upserted,
          username: options.username,
          avatar: options.avatar,
          images: []
        });
        return resolve(_.extend({}, options, {_id: info.lastErrorObject.upserted}));
      }
      return resolve(info.value);
    };
    var query = {};
    query[key] = options[key];
    self.collection.findAndModify(query, [], { $set: options }, { upsert: true }, callback);
  });
};

userSchema.methods.addImage = function(params) {
  var user = this;
  return new promise(function(resolve, reject) {
    var fields = {
      url: params.url,
      title: params.title
    };
    var errors = imageValidation(fields);
    if (errors.length !== 0) return reject(new ModelInvalid(errors.join("; ")));
    user.images.push(fields);
    var image = user.images[user.images.length-1];
    user.save().then(function() {
      broadcastImageAdd(image.renderJson(user._id));
      return resolve(image);
    }).catch(reject);
  });
};

userSchema.methods.removeImage = function(id) {
  var user = this;
  return new promise(function(resolve, reject) {
    var image = user.images.id(id);
    user.images.pull(id);
    if (!image) return reject(new NotFound("Image not found"));
    image.remove();
    user.save().then(function() {
      broadcastImageRemove(image._id);
      return resolve(image);
    }).catch(reject);
  });
};

userSchema.methods.renderToken = function() {
  return _.extend({}, this.renderJson(), {
    token: this.token
  });
};

userSchema.methods.renderJson = function () {
  var user = this;
  return {
    id: this._id,
    username: this.username,
    avatar: this.avatar,
    images: this.images.map(function(image) {
      return image.renderJson(user._id)
    }),
    createdAt: this._id.getTimestamp()
  };
};

var User = mongoose.model('User', userSchema);

// Passport
passport.use(new TwitterStrategy({
  consumerKey: config.twitter.key,
  consumerSecret: config.twitter.secret,
  callbackURL: config.baseUrl + "/oauth/twitter"
}, function(token, secret, profile, done) {
  User.upsert('twitterId', { twitterId: profile.id, username: profile.username, avatar: profile._json.profile_image_url_https, token: token, secret: secret }).then(done.bind(this, null)).catch(done);
}));

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

// App setup

var app = express();
app.use(session({
  resave: false,
  saveUninitialized: false,
  store: new RedisStore({url: config.redis}),
  secret: config.secret
}));

var jsonParser = bodyParser.json();
app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

// Helpers

var unauthorized = function(res, message) {
  return res.status(401).json({
    error: message || "Unauthorized"
  });
};

var notFound = function(res, message) {
  return res.status(404).json({
    error: message || "Not Found"
  });
};

var invalid = function(res, message) {
  return res.status(422).json({
    error: message || "Invalid"
  });
};

var internalError = function(res) {
  return res.status(500).json({
    error: "Something went wrong"
  });
};

var handleError = function(res, err) {
  if (typeof err === "string") {
    console.log(err);
  } else {
    console.log(err.toString());
  }
  if (err instanceof NotFound) return notFound(res, err.toString());
  if (err instanceof ModelInvalid) return invalid(res, err.toString());
  if (err instanceof Unauthorized) return unauthorized(res, err.toString());
  return internalError(res);
};

var authenticate = function(req, res, next) {
  if (!req.user) return unauthorized(res);
  return next();
};

// Routes
app.get('/session', passport.authenticate('twitter'));
app.get('/oauth/twitter', passport.authenticate('twitter', { failureRedirect: '/' }), function(req, res) {
  res.redirect('/');
});
app.get(/^\/(users|profile).*/, function(req, res) {
  res.sendFile(path.resolve(__dirname + '/public/index.html'));
});

// API
var router  = express.Router();
app.use('/api/v1', router);

router.delete('/session', authenticate, function(req, res) {
  req.logout();
  res.status(202).json({});
});

router.get('/profile', authenticate, function(req, res) {
  res.status(200).json(req.user.renderToken());
});

router.delete('/profile', authenticate, function(req, res) {
  req.user.remove().then(function() {
    res.status(202).json(req,user.renderJson());
    broadcastUserRemove(req.user._id);
    req.logout();
  }).catch(handleError.bind(this, res));
});

router.get('/users', function(req, res) {
  User.find({}).then(function(users) {
    res.status(200).json(users.map(function(user) {
      return user.renderJson();
    }));
  }).catch(handleError.bind(this, res));
});

router.get('/users/:id', function(req, res) {
  User.findById(req.params.id).then(function(user) {
    if (!user) throw new NotFound("User not found.");
    res.status(200).json(user.renderJson());
  }).catch(handleError.bind(this, res));
});

router.post('/images', authenticate, jsonParser, function(req, res) {
  req.user.addImage(req.body).then(function (image) {
    res.status(201).json(image.renderJson(req.user._id));
  }).catch(handleError.bind(this, res));
});

router.delete('/images/:id', authenticate, function(req, res) {
  req.user.removeImage(req.params.id).then(function (image) {
    res.status(201).json(image.renderJson(req.user._id));
  }).catch(handleError.bind(this, res));
});

server.on('request', app);
module.exports = server.listen(config.port, function() {
  console.log('Images app listening on port ' + config.port + '!');
});

// Websocket

var socketConnections = {};
var socketOriginAllowed = function(origin) {
  return origin === config.baseUrl;
};

var broadcast = function(payload, entity, type) {
  if (!websocket) return;
  for (var key in socketConnections) {
    socketConnections[key].sendUTF(JSON.stringify({
      type: type,
      entity: entity,
      payload: payload
    }));
  }
}
var broadcastImageAdd = function(image) {
  broadcast(image, 'images', 'add');
};
var broadcastImageRemove = function(image) {
  broadcast(image, 'images', 'remove');
};
var broadcastUserAdd = function(user) {
  broadcast(user, 'users', 'add');
};
var broadcastUserRemove = function(user) {
  broadcast(user, 'users', 'remove');
};

var websocket = new WebSocketServer({
  httpServer: server,
  fragmentOutgoingMessages: false,
  autoAcceptConnections: false
});

websocket.on('request', function(request) {
  if (!socketOriginAllowed(request.origin)) return request.reject();
  var connection = request.accept('images', request.origin);
  var id = hat();
  socketConnections[id] = connection;

  connection.on('close', function() {
    delete socketConnections[id];
  });
});
