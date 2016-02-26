import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Bricks from '../utils/bricks.js'

import { users } from '../actions'
import Images from '../components/images'
import { sortTimestamp } from '../utils/time'

const maxCount = 5
const testImages = [{
  id: 1,
  url: "http://placehold.it/350x150",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 2,
  url: "http://placehold.it/100x300",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 3,
  url: "http://placehold.it/300x400",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 4,
  url: "http://placehold.it/350x650",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 5,
  url: "http://placehold.it/350x150",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 6,
  url: "http://placehold.it/100x300",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 7,
  url: "http://placehold.it/300x400",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
},{
  id: 8,
  url: "http://placehold.it/350x650",
  title: "Test",
  description: "This is a description",
  user: {
    username: "User",
    avatar: "http://placehold.it/100x100",
  }
}]

class ImagesPage extends Component {
  componentWillMount() {
    this.props.loadUsers()
  }

  render() {
    let images = this.props.images
    if (images.length > maxCount) images = images.slice(0, maxCount)
    return (
      <Images title="Recent pins:" images={images} />
    )
  }
}

function mapStateToProps(state) {
  const images = sortTimestamp('createdAt', Object.values(state.cache.images).map(image => {
    return Object.assign({}, image, { user: state.cache.users[image.user] })
  }))
  return {
    images: images
  }
}

export default connect(mapStateToProps, {
  loadUsers: users.loadAll
})(ImagesPage)
