import { Schema, arrayOf, normalize } from 'normalizr'
import 'isomorphic-fetch'

import { convertTimestamps } from '../utils/time'
import * as Constants from './constants'

export function handleError(dispatch, constant, error) {
  if (process.env.NODE_ENV !== 'production') console.log(error)
  // this first if statement really shouldn't happen, it means we're getting an unknown error thrown somewhere in the call stack of api requests that isn't a user-controlled error
  if (typeof error.json !== 'function') return dispatch({ type: constant, error: "An unknown error has occurred" })
  error.json().then(json => dispatch({ type: constant, error: json.error })).catch(() => dispatch({ type: constant, error: "JSON parser error" }))
}

export function api(endpoint, userParams = {}, body = null) {
  let params = Object.assign({}, { headers: {}, method: "get", schema: null }, userParams)
  const fullUrl = Constants.API_ROOT + endpoint
  let ajaxHeaders = Object.assign({}, params.headers, {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  })
  let payload = {
    credentials: 'same-origin',
    method: params.method,
    headers: ajaxHeaders
  }
  if (body) {
    payload = Object.assign(payload, {body: JSON.stringify(body)})
  }
  return fetch(fullUrl, payload).then(response => {
    if (response.status >= 400) {
      throw response;
    }
    return new Promise((resolve, reject) => {
      response.json().then(json => {
        const converted = convertTimestamps(['createdAt', 'updatedAt'], json)
        if (params.schema) return resolve(normalize(converted, params.schema))
        return resolve(converted)
      }).catch(reject)
    })
  })
}

//Schemas

const user = new Schema('users')
const image = new Schema('images')
const users = arrayOf(user)
const images = arrayOf(image)

user.define({ images });

export const Schemas = { user, users, image, images }
