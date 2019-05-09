import React, { Component, forwardRef } from 'react'
import { View, WebView } from 'react-native'
import editorCode from '../lib/editor'
import Theme from '../components/Theme'
import SettingsContext from '../components/SettingsContext'

const FML = class extends Component {
  render() {
    return (
      <View style={{
        height: '100%',
        display: this.props.hidden ? 'none' : 'flex'
      }}>
        <Theme>
          <WebView
            useWebKit={true}
            originWhitelist={[ '*' ]}
            source={{ html: editorCode }}
            ref={(webView) => this.webView = webView}
            onMessage={this.onMessage}
          />
        </Theme>
      </View>
    )
  }

  componentDidUpdate() {
    if (
      this.props.code !== undefined
      && this.props.path !== undefined
      && this.webView
    ) {
      this.webView.postMessage(JSON.stringify({
        code: this.props.code,
        path: this.props.path,
        dark: this.props.context.theme,
        softWrapping: this.props.context.softWrapping,
        indentSize: this.props.context.indentSize,
        softTabs: this.props.context.softTabs
      }))
    }
  }

  onMessage = (event) => {
    const code = event.nativeEvent.data
    this.props.onChange && this.props.onChange(code)
  }
}

// ContextType wasn't working...
export default forwardRef((props, ref) => (
  <SettingsContext.Consumer>
    {(context) => (
      <FML {...props} ref={ref} context={context} />
    )}
  </SettingsContext.Consumer>
))