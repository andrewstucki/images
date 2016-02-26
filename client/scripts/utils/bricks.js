// bricks.js
// modified by: Andrew Stucki

// The MIT License (MIT)
//
// Copyright (c) 2016 Michael Cavalea
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export default (options = {}) => {
  // globals

  let persist           // updating or packing all elements?
  let ticking           // for debounced resize

  let sizeIndex
  let sizeDetail

  let columnHeights

  let nodes
  let nodesWidth
  let nodesHeights

  // options

  const container = document.querySelector(options.container)
  const packed    = options.packed.indexOf('data-') === 0 ? options.packed : `data-${ options.packed }`
  const sizes     = options.sizes.slice().reverse()

  const selectors = {
    all: `${ options.container } > *`,
    new: `${ options.container } > *:not([${ packed }])`
  }

  // series

  const setup = [
    setSizeIndex,
    setSizeDetail,
    setColumns
  ]

  const run = [
    setNodes,
    setNodesDimensions,
    setNodesStyles,
    setContainerStyles
  ]

  // instance

  const instance = {
    pack,
    update,
    resize
  }

  return instance

  // general helpers

  function runSeries(functions) {
    functions.forEach(func => func())
  }

  // array helpers

  function toArray(selector) {
    return Array.prototype.slice.call(document.querySelectorAll(selector))
  }

  function fillArray(length) {
    return Array.apply(null, Array(length)).map(() => 0)
  }

  // size helpers

  function getSizeIndex() {
    // find index of widest matching media query
    return sizes
      .map(size => size.mq && window.matchMedia(`(min-width: ${ size.mq })`).matches)
      .indexOf(true)
  }

  function setSizeIndex() {
    sizeIndex = getSizeIndex()
  }

  function setSizeDetail() {
    // if no media queries matched, use the base case
    sizeDetail = sizeIndex === -1
      ? sizes[sizes.length - 1]
      : sizes[sizeIndex]
  }

  // column helpers

  function setColumns() {
    columnHeights = fillArray(sizeDetail.columns)
  }

  // node helpers

  function setNodes() {
    nodes = toArray(persist ? selectors.new : selectors.all)
  }

  function setNodesDimensions() {
    if (nodes.length === 0) return
    nodesWidth   = nodes[0].clientWidth
    nodesHeights = nodes.map(element => element.clientHeight)
  }

  function setNodesStyles() {
    nodes.forEach((element, index) => {
      const target = columnHeights.indexOf(Math.min.apply(Math, columnHeights))

      element.style.position  = 'absolute'
      element.style.top       = `${ columnHeights[target] }px`
      element.style.left      = `${ (target * nodesWidth) + (target * sizeDetail.gutter) }px`

      element.setAttribute(packed, '')

      columnHeights[target] += nodesHeights[index] + sizeDetail.gutter
    })
  }

  // container helpers

  function setContainerStyles() {
    container.style.position = 'relative'
    container.style.width    = `${ sizeDetail.columns * nodesWidth + (sizeDetail.columns - 1) * sizeDetail.gutter }px`
    container.style.height   = `${ Math.max.apply(Math, columnHeights) - sizeDetail.gutter }px`
  }

  // resize helpers

  function resizeFrame() {
    if(!ticking) {
      requestAnimationFrame(resizeHandler)
      ticking = true
    }
  }

  function resizeHandler() {
    if(sizeIndex !== getSizeIndex()) pack()
    ticking = false
  }

  // API

  function pack() {
    persist = false
    runSeries(setup.concat(run))

    return instance
  }

  function update() {
    persist = true
    runSeries(run)

    return instance
  }

  function resize() {
    window.addEventListener('resize', resizeFrame)

    return instance
  }
}
