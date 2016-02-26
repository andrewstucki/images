import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router'
import { pushState } from 'redux-router'
import AppBar from 'material-ui/lib/app-bar'
import IconButton from 'material-ui/lib/icon-button';
import FontIcon from 'material-ui/lib/font-icon';
import ThemeManager from 'material-ui/lib/styles/theme-manager'

import theme from '../theme'
import LinkForm from '../components/link-form'
import { flash, users, images } from '../actions'

const styles = {
  container: {
    textAlign: 'center',
    width: "100%"
  },
}

class App extends Component {
  constructor(props) {
    super(props)
    this.handleDismissClick = this.handleDismissClick.bind(this)
    this.logout = this.logout.bind(this)
    this.navigateProfile = this.navigateProfile.bind(this)
    this.addLink = this.addLink.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleOpen = this.handleOpen.bind(this)

    this.state = {
      linkOpen: false
    }
  }

  getChildContext() {
    return {
      muiTheme: ThemeManager.getMuiTheme(theme),
    }
  }

  handleOpen() {
    this.setState({
      linkOpen: true
    })
  }

  handleClose() {
    this.setState({
      linkOpen: false
    })
  }

  addLink(linkData) {
    this.setState({
      linkOpen: false
    })
    this.props.addImage(linkData)
  }

  navigateProfile(e) {
    e.preventDefault()
    this.props.pushState(null, '/profile')
  }

  logout(e) {
    e.preventDefault()
    this.props.logout()
  }

  handleDismissClick(e) {
    e.preventDefault()
    this.props.resetMessage()
  }

  renderMessage() {
    const { flash } = this.props

    if (!flash || !flash.type || !flash.message) {
      return null
    }

    return (
      <p style={{padding: 10}} className={`text-${flash.type}`}>
        <b>{flash.message}</b>
        {' '}
        (<a href="#"
            onClick={this.handleDismissClick}>
          Dismiss
        </a>)
      </p>
    )
  }

  render() {
    const { children, isAuthenticated, user } = this.props

    const loginButton = (
      <IconButton href="/session" linkButton={true} iconStyle={{color: '#fff'}} tooltip="Sign in">
        <FontIcon className="octicon octicon-sign-in" />
      </IconButton>
    )

    const logoutButton = (
      <span>
        <IconButton onClick={this.handleOpen} iconClassName="material-icons" linkButton={true} tooltip="Add Image" style={{top: "-1px"}} iconStyle={{color: "#fff"}}>
          control_point
        </IconButton>
        <IconButton href="/profile" onClick={this.navigateProfile} iconClassName="material-icons" linkButton={true} tooltip="Profile" style={{top: "-9px"}} iconStyle={{color: "#fff"}}>
          face
        </IconButton>
        <IconButton onClick={this.logout} linkButton={true} tooltip="Sign out" iconStyle={{color: "#fff"}} style={{top: "-4px"}}>
          <FontIcon className="octicon octicon-sign-out" />
        </IconButton>
      </span>
    )

    const title = (
      <Link to="/" style={{color: '#fff'}} className="no-underline">ImagesApp</Link>
    )

    return (
      <div>
        <AppBar zDepth={2} title={title} showMenuIconButton={false} iconElementRight={ isAuthenticated ? logoutButton : loginButton}/>
        <LinkForm submit={this.addLink} close={this.handleClose} opened={this.state.linkOpen} />
        <div style={styles.container}>
          <div className="wrapper">
            {children}
          </div>
        </div>
      </div>
    )
  }
}

App.childContextTypes = {
  muiTheme: React.PropTypes.object
}

function mapStateToProps(state) {
  return {
    flash: state.message,
    isAuthenticated: state.isAuthenticated,
    user: state.user
  }
}

export default connect(mapStateToProps, {
  resetMessage: flash.resetMessage,
  logout: users.logout,
  addImage: images.addImage,
  pushState: pushState
})(App)
