import React, { Component } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import AssetUtils from 'expo-asset-utils'

import reCaptchaCode from '../../html/reCaptcha.html'

export default class extends Component {
  state = {
    source: null
  }

  render() {
    return (
      <View style={{ opacity: 0 }}>
        {this.state.source ? (
          <WebView
            useWebKit
            originWhitelist={['*']}
            source={{ uri: '../../html/reCaptcha.html', baseUrl: 'https://repl.it/' }}
            onMessage={this.onReady}
          />
        ) : null}
      </View>
    )
  }

  componentDidMount() {
    this.loadHtml()
  }

  async loadHtml() {
    const { uri } = await AssetUtils.resolveAsync(reCaptchaCode)
    const res = await fetch(uri)
    const html = await res.text()
    this.setState({ source: html })
  }

  onReady = (event) => {
    const token = event.nativeEvent.data
    this.props.onExecute && this.props.onExecute(token)
  }
}
