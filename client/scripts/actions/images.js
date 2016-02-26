import * as Constants from './constants'
import { normalize } from 'normalizr'
import { api, handleError, Schemas } from './api'

export function addImage(image) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.IMAGE_CREATE_REQUEST })
    return api('/images', { method: 'post', schema: Schemas.images }, image)
      .then(json => dispatch({ type: Constants.IMAGE_CREATE_SUCCESS, value: json }))
      .catch(err => handleError(dispatch, Constants.IMAGE_CREATE_FAILURE, err))
  }
}

export function deleteImage(id) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.IMAGE_DELETE_REQUEST })
    return api(`/images/${id}`, { method: 'delete' })
      .then(json => dispatch({ type: Constants.IMAGE_DELETE_SUCCESS, entity: 'images', value: id }))
      .catch(err => handleError(dispatch, Constants.IMAGE_DELETE_FAILURE, err))
  }
}

export function add(record) {
  return { type: Constants.IMAGE_ADD, value: normalize(record, Schemas.image) }
}

export function remove(id) {
  return { type: Constants.IMAGE_REMOVE, entity: 'images', value: id }
}
