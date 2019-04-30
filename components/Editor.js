import React, { Component } from 'react'
import { View, WebView } from 'react-native'
import editorCode from '../lib/editor.js'

export default class extends Component {
  render() {
    return (
      <View style={{ height: '100%', width: '100%', overflow:'hidden' }}>
        <WebView
          originWhitelist={[ '*' ]}
          source={{ html: editorCode }}
        />
      </View>
    )
  }
}