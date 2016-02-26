import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import Images from '../components/images'

class ProfilePage extends Component {
  render() {
    return (
      <Images title={`Pins by ${this.props.user.username}:`} images={this.props.images} />
    )
  }
}

function mapStateToProps(state) {
  const { cache: { images } } = state
  const user = state.user

  return {
    user: user,
    images: (user ? user.images : []).map(image => {
      let filteredImage = Object.assign({}, images[image])
      filteredImage.user = user
      return filteredImage
    })
  }
}

export default connect(mapStateToProps, {})(ProfilePage)
