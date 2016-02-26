import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Bricks from '../utils/bricks.js'

import Image from '../components/image'

const sizes = [
  { columns: 2, gutter: 10 },
  { mq: '768px', columns: 3, gutter: 25 },
  { mq: '1024px', columns: 4, gutter: 50 }
]

export default class Images extends Component {
  constructor(props) {
    super(props)
    this.reloadGrid = this.reloadGrid.bind(this)
    this.reloadTimer = null
  }

  componentDidMount() {
    this.grid = Bricks({
      container: '[data-grid]',
      packed: 'data-packed',
      sizes: sizes
    })
    this.grid.resize().pack()
  }

  componentDidUpdate() {
    this.grid.update()
  }

  reloadGrid() {
    const self = this
    if (this.reloadTimer) clearTimeout(this.reloadTimer)
    this.reloadTimer = setTimeout(() => {
      if (self.grid) self.grid.pack()
      this.reloadTimer = null
    }, 50)
  }

  renderImages() {
    return this.props.images.map(image => {
      return <Image key={image.id} user={image.user} image={image} onLoad={this.reloadGrid} />
    })
  }

  render() {
    return (
      <div>
        <h1 className="title">{this.props.title}</h1>
        <div className="grid" data-grid>{this.renderImages()}</div>
      </div>
    )
  }
}

Images.propTypes = {
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  title: PropTypes.string.isRequired
}
