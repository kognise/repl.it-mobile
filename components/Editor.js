import React, { Component } from 'react'
import { View, WebView } from 'react-native'
import editorCode from '../lib/editor'
import Theme from '../components/Theme'
import { withTheme } from 'react-native-paper'

export default withTheme(class extends Component {
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
        dark: this.props.theme.dark
      }))
    }
  }

  onMessage = (event) => {
    const code = event.nativeEvent.data
    this.props.onChange && this.props.onChange(code)
  }
})