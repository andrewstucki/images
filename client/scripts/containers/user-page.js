import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { users } from '../actions'

import Images from '../components/images'

class UserPage extends Component {
  componentWillMount() {
    this.props.loadUser(this.props.params.id)
  }

  render() {
    if (!this.props.user) return (<div>Loading...</div>)
    return (
      <Images title={`Pins by ${this.props.user.username}:`} images={this.props.images} />
    )
  }
}

function mapStateToProps(state) {
  const { cache: { users, images } } = state
  const user = users[state.router.params.id]

  return {
    user: user,
    images: (user ? user.images : []).map(image => {
      let filteredImage = Object.assign({}, images[image])
      filteredImage.user = user
      return filteredImage
    })
  }
}

export default connect(mapStateToProps, {
  loadUser: users.load
})(UserPage)
