import * as Constants from './constants'
import { normalize } from 'normalizr'
import { api, handleError, Schemas } from './api'

export function load(id) {
  return (dispatch, getState) => {
    if (getState().cache.users[id]) return null
    dispatch({ type: Constants.USER_REQUEST })
    return api(`/users/${id}`, { schema: Schemas.users })
      .then(json => dispatch({ type: Constants.USER_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.USER_FAILURE, err))
  }
}

export function loadAll(forceUpdate = false) {
  return (dispatch, getState) => {
    if (getState().cache.usersLoaded && !forceUpdate) return null
    dispatch({ type: Constants.USERS_REQUEST })
    return api('/users', { schema: Schemas.users })
      .then(json => dispatch({ type: Constants.USERS_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.USERS_FAILURE, err))
  }
}

export function logout() {
  return (dispatch, getState) => {
    dispatch({ type: Constants.LOGOUT_REQUEST })
    return api('/session', { method: 'delete' })
      .then(json => dispatch({ type: Constants.LOGOUT_SUCCESS }))
      .catch(err => handleError(dispatch, Constants.LOGOUT_FAILURE, err))
  }
}

export function add(record) {
  return { type: Constants.USER_ADD, entity: 'users', value: normalize(record, Schemas.user) }
}

export function remove(id) {
  return { type: Constants.USER_REMOVE, entity: 'users', value: id }
}
