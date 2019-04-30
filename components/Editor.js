import React, { Component } from 'react'
import { View, WebView } from 'react-native'
import editorCode from '../lib/editor.js'

export default class extends Component {
  render() {
    return (
      <View style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        display: this.props.hidden ? 'none' : 'flex'
      }}>
        <WebView
          originWhitelist={[ '*' ]}
          source={{ html: editorCode }}
          ref={(webview) => this.webview = webview}
        />
      </View>
    )
  }

  componentDidUpdate() {
    if (this.props.code && this.webview) {
      this.webview.postMessage(this.props.code)
    }
  }
}