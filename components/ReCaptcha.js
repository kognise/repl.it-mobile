import React, { Component } from 'react'
import { View, WebView } from 'react-native'
import reCaptchaCode from '../lib/reCaptcha'

export default class extends Component {
  render() {
    return (
      <View style={this.props.style}>
        <WebView
          useWebKit={true}
          originWhitelist={[ '*' ]}
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