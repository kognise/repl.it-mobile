import React, { PureComponent } from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'
import AssetUtils from 'expo-asset-utils'

import editorCode from '../../html/editor.html'
import withSettings from '../../lib/withSettings'

import Theme from '../wrappers/Theme'
import ActivityIndicator from '../customized/ActivityIndicator'

export default withSettings(
  class extends PureComponent {
    loaded = false
    state = {
      source: null
    }

    render() {
      return (
        <View
          style={{
            height: '100%',
            display: this.props.hidden ? 'none' : 'flex'
          }}
        >
          <Theme>
            {this.state.source ? (
              <WebView
                useWebKit
                originWhitelist={['*']}
                source={{ html: this.state.source }}
                ref={(webView) => (this.webView = webView)}
                onMessage={this.onMessage}
              />
            ) : (
              <ActivityIndicator />
            )}
          </Theme>
        </View>
      )
    }

    componentDidMount() {
      this.loadHtml()
    }

    async loadHtml() {
      const { uri } = await AssetUtils.resolveAsync(editorCode)
      const res = await fetch(uri)
      const html = await res.text()
      this.setState({ source: html })
    }

    componentDidUpdate() {
      this.updateWebView()
    }

    updateWebView() {
      if (
        this.loaded &&
        this.props.code !== undefined &&
        this.props.path !== undefined &&
        this.webView
      ) {
        this.webView.postMessage(
          JSON.stringify({
            code: this.props.code,
            path: this.props.path,
            dark: this.props.context.theme,
            canWrite: this.props.canWrite,
            softWrapping: this.props.context.softWrapping,
            indentSize: this.props.context.indentSize,
            softTabs: this.props.context.softTabs
          })
        )
      }
    }

    onMessage = (event) => {
      const json = JSON.parse(event.nativeEvent.data)
      if (json.type === 'load') {
        this.loaded = true
        this.updateWebView()
      } else if (json.type === 'update') {
        this.props.onChange && this.props.onChange(json.data)
      }
    }
  }
)
