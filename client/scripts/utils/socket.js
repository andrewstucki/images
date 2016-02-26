import { constants, users, images } from '../actions'

export default class Socket {
  constructor(url, store) {
    const socketProtocol = window.location.protocol === "https:" ? 'wss' : 'ws'
    const self = this

    this.websocket = new WebSocket(`${socketProtocol}://${url}`, 'images')
    this.store = store
    this.connected = false

    this.websocket.onmessage = event => self.handleMessage(JSON.parse(event.data))
    this.websocket.onopen = () => self.connected = true
    this.websocket.onclose = () => {
      self.connected = false
    }
  }

  handleMessage(data) {
    switch (data.type) {
    case 'add':
      switch(data.entity) {
        case 'users':
          return this.store.dispatch(users.add(data.payload))
        case 'images':
          return this.store.dispatch(images.add(data.payload))
      }
      break
    case 'remove':
      switch(data.entity) {
        case 'users':
          return this.store.dispatch(users.remove(data.payload))
        case 'images':
          return this.store.dispatch(images.remove(data.payload))
      }
      break
    }
  }

  close() {
    this.websocket.close()
  }
}
