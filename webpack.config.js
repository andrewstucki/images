var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  entry: {
    app: ['./client/scripts/app.js', './client/less/app.less']
  },

  resolve: {
    root: './client/scripts',
    extensions: ['', '.js']
  },

  output: {
    path: 'public',
    publicPath: '/',
    filename: '[name]-[chunkhash].js'
  },

  module: {
    loaders: [
      { test: /\.less$/, loader: ExtractTextPlugin.extract('style', 'css?importLoaders=2&sourceMap!less?outputStyle=compressed&sourceMap=false&sourceMapContents=false') },
      { test: /\.js$/, exclude: /node_modules/, loader: "babel" },
    ]
  },

  plugins: [
    new CleanWebpackPlugin(['public']),
    new ExtractTextPlugin('[name]-[chunkhash].css', {allChunks: true}),
    new HtmlWebpackPlugin({
      template: './client/index.html',
      hash: false,
      // favicon: paths.client('static/favicon.ico'),
      filename: 'index.html',
      inject: 'body',
      minify: {
        collapseWhitespace: true
      }
    }),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"'
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    })
  ]
};
