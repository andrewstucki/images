import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Bricks from '../utils/bricks.js'

import { users } from '../actions'
import Images from '../components/images'
import { sortTimestamp } from '../utils/time'

const maxCount = 100

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
