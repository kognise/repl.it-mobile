import React, { Component } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import reCaptchaCode from '../../lib/reCaptcha'

export default class extends Component {
  render() {
    return (
      <View style={{ opacity: 0 }}>
        <WebView
          useWebKit
          originWhitelist={['*']}
          source={{ html: reCaptchaCode, baseUrl: 'https://repl.it/' }}
          onMessage={this.onReady}
        />
      </View>
    )
  }

  onReady = (event) => {
    const token = event.nativeEvent.data
    this.props.onExecute && this.props.onExecute(token)
  }
}
