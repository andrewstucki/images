import { omit } from 'lodash/object'
import { routerStateReducer as router } from 'redux-router'
import { combineReducers } from 'redux'

import { constants, flash } from './actions'

function removeCache(state, entity, value) {
  let newState = {}
  newState[entity] = omit(state[entity], value)
  return Object.assign({}, state, newState)
}

function cache(state = { users: {}, usersLoaded: false, images: {}, imagesLoaded: false }, action) {
  const { type, entity, value } = action
  switch(type) {
  case constants.USERS_SUCCESS:
    return Object.assign({}, { usersLoaded: true, imagesLoaded: true, users: {}, images: {}}, value.entities)
  case constants.USER_SUCCESS:
  case constants.USER_ADD:
  case constants.IMAGE_ADD:
    const newUsers = Object.assign({}, state.users, value.entities.users || {})
    const newImages = Object.assign({}, state.images, value.entities.images || {})
    return Object.assign({}, state, { users: newUsers, images: newImages })
  case constants.USER_REMOVE:
  case constants.IMAGE_REMOVE:
    return removeCache(state, entity, value)
  }
  return state
}

function message(state = null, action) {
  const { type, value, error } = action
  switch(type) {
    case constants.RESET_MESSAGE:
    case "@@reduxReactRouter/routerDidChange":
      return null
    case constants.SET_MESSAGE:
      return value
    default:
      if (error) return {
        type: flash.ERROR,
        message: error
      }
  }
  return state
}

function isAuthenticated(state = false, action) {
  if (constants.LOGOUT_SUCCESS === action.type) return false
  return state
}

function user(state = null, action) {
  if (constants.LOGOUT_SUCCESS === action.type) return null
  return state
}

export default combineReducers({
  cache,
  message,
  isAuthenticated,
  user,
  router
})
