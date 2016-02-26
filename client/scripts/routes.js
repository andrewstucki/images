import React from 'react'
import { Route, IndexRoute } from 'react-router'

import App from './containers/app'
import ImagesPage from './containers/images-page'
import ProfilePage from './containers/profile-page'
import UserPage from './containers/user-page'

import { requireAuth } from './utils/auth'

export default (
  <Route path='/' component={App}>
    <IndexRoute component={ImagesPage} />
    <Route path='/users/:id' name='user' component={UserPage} />
    <Route path='/profile' name='admin-profile' component={requireAuth(ProfilePage)} />
  </Route>
)
