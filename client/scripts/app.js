import 'babel-polyfill'
import injectTapEventPlugin from 'react-tap-event-plugin'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/root'
import configureStore from './store'
import { api, Schemas } from './actions'
import Socket from './utils/socket'

injectTapEventPlugin()

const token = localStorage.getItem("token")

function initializeApplication(payload) {
  let store
  let user
  if (payload && Object.values(payload.entities.users).length > 0) user = Object.values(payload.entities.users)[0]
  if (user) {
    store = configureStore({ isAuthenticated: true, user: user, cache: Object.assign({}, { images: {}, usersLoaded: false }, payload.entities) })
  } else {
    store = configureStore({ isAuthenticated: false })
  }

  const socket = new Socket(window.location.host || 'localhost', store)

  render(
    <Root store={store} />,
    document.getElementById('application')
  )
}

api('/profile', { schema: Schemas.users }).then(initializeApplication).catch(err => initializeApplication())
