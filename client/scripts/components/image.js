import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import Colors from 'material-ui/lib/styles/colors'
import Card from 'material-ui/lib/card/card'
import CardHeader from 'material-ui/lib/card/card-header'
import CardMedia from 'material-ui/lib/card/card-media'
import CardActions from 'material-ui/lib/card/card-actions'
import FlatButton from 'material-ui/lib/flat-button'

import { images } from '../actions'

class Image extends Component {
  constructor(props) {
    super(props)
    this.loaded = this.loaded.bind(this)
    this.errored = this.errored.bind(this)
    this.deleteImage = this.deleteImage.bind(this)
    this.error = false
  }

  loaded(e) {
    if (this.props.onLoad) this.props.onLoad()
  }

  errored(e) {
    if (this.error) return
    e.target.src = 'https://placeholdit.imgix.net/~text?txtsize=33&txt=N/A&w=200&h=200'
    this.error = true
  }

  deleteImage() {
    this.props.deleteImage(this.props.image.id)
  }

  render() {
    const url = this.props.currentUser && this.props.user.id === this.props.currentUser.id ? '/profile' : `/users/${this.props.user.id}`
    const name = this.props.currentUser && this.props.user.id === this.props.currentUser.id ? 'me' : this.props.user.username
    const actions = this.props.currentUser && this.props.user.id === this.props.currentUser.id
      ? (<CardActions style={{backgroundColor: Colors.grey100}}><FlatButton label="Delete" onClick={this.deleteImage} /></CardActions>)
      : ''
    const link = (<Link to={url}>{name}</Link>)
    return (
      <Card style={{width: '200px'}}>
        <CardHeader style={{textAlign: 'left', backgroundColor: Colors.grey200}} title={this.props.image.title || 'Untitled'} subtitle={link} avatar={this.props.user.avatar} />
        <CardMedia style={{padding: "5px"}}>
          <img src={this.props.image.url} onError={this.errored} onLoad={this.loaded}/>
        </CardMedia>
        {actions}
      </Card>
    )
  }
}

function mapStateToProps(state) {
  return {
    currentUser: state.user
  }
}

export default connect(mapStateToProps, {
  deleteImage: images.deleteImage
})(Image)
