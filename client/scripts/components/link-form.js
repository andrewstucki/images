import React, { Component } from 'react'
import TextField from 'material-ui/lib/text-field'
import Dialog from 'material-ui/lib/dialog'
import FlatButton from 'material-ui/lib/flat-button'

export default class LinkForm extends Component {
  constructor(props) {
    super(props)

    this.updateUrl = this.updateUrl.bind(this)
    this.updateTitle = this.updateTitle.bind(this)
    this.submitForm = this.submitForm.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.loaderTimer = null

    this.state = {
      url: '',
      urlError: '',
      title: '',
      imageNode: '',
    }
  }

  componentWillMount() {
    this.setState({
      url: '',
      urlError: '',
      title: '',
      imageNode: ''
    })
  }

  submitForm() {
    const cleanedUrl = this.state.url.trim()
    let cleanedTitle = this.state.title.trim()

    if (cleanedUrl === "") return this.setState({
      urlError: "URL cannot be blank."
    })
    if (cleanedTitle === "") cleanedTitle = null
    this.props.submit({
      url: cleanedUrl,
      title: cleanedTitle
    })
  }

  loadImage() {
    this.setState({
      imageNode: <img src={this.state.url} style={{maxWidth: "200px", maxHeight: "200px"}} onError={(e) => e.target.src = 'https://placeholdit.imgix.net/~text?txtsize=33&txt=N/A&w=200&h=200'} />
    })
  }

  updateUrl(e) {
    const self = this
    if (this.loaderTimer) clearTimeout(this.loaderTimer)
    this.loaderTimer = setTimeout(() => {
      self.loadImage()
    }, 800)

    this.setState({
      url: e.target.value
    })
  }

  updateTitle(e) {
    this.setState({
      title: e.target.value
    })
  }

  componentWillReceiveProps(props) {
    if (props.opened !== this.props.opened) this.setState({
      url: '',
      urlError: '',
      title: '',
      imageNode: ''
    })
  }

  handleClose() {
    this.props.close()
  }

  render() {
    const actions = [
      <FlatButton label="Add" primary={true} keyboardFocused={true} onTouchTap={this.submitForm} />,
      <FlatButton label="Cancel" primary={false} keyboardFocused={false} onTouchTap={this.handleClose} />,
    ]

    return (
      <Dialog title="Add a link" actions={actions} modal={false} open={this.props.opened} onRequestClose={this.handleClose}>
        <div className="link-form-wrapper">
          <div className="link-form">
            <TextField errorText={this.state.urlError} hintText="http://example.com/image.jpg" onEnterKeyDown={this.submitForm} onChange={this.updateUrl} value={this.state.url} floatingLabelText="URL" /><br/>
            <TextField hintText="Title" onChange={this.updateTitle} value={this.state.title} onEnterKeyDown={this.submitForm} />
          </div>
          <div className="image-preview-wrapper">
            <div className="image-preview">
              {this.state.imageNode}
            </div>
          </div>
        </div>
      </Dialog>
    )
  }
}
