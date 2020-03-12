import React from 'react'
import { View } from 'react-native'
import { WebView } from 'react-native-webview'

import useSource from '../../lib/useSource'
import code from '../../html/reCaptcha.html'

export default (props) => {
  const source = useSource(code)

  return (
    <View style={{ opacity: 0 }}>
      {source ? (
        <WebView
          useWebKit
          originWhitelist={['*']}
          source={{ html: source, baseUrl: 'https://repl.it/' }}
          onMessage={(event) => props.onExecute(event.nativeEvent.data)}
        />
      ) : null}
    </View>
  )
}
