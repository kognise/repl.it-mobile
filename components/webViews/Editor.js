import React, { memo, useRef, useCallback, useEffect } from 'react'
import { View } from 'react-native'
import { useTheme } from 'react-native-paper'
import { WebView } from 'react-native-webview'

import useSource from '../../lib/useSource'
import withSettings from '../../lib/withSettings'
import Theme from '../wrappers/Theme'
import ActivityIndicator from '../ui/ActivityIndicator'
import code from '../../html/editor.html'

export default withSettings(
  memo(({ otClient, path, canWrite, context }) => {
    const source = useSource(code)
    const theme = useTheme()

    const webView = useRef()
    const webViewReady = useRef(false)
    const webViewQueue = useRef([])

    const postMessage = (message) => {
      if (webViewReady.current && webView.current) {
        webView.current.postMessage(JSON.stringify(message))
      } else {
        webViewQueue.current.push(message)
      }
    }

    const onMessage = useCallback(
      (event) => {
        const json = JSON.parse(event.nativeEvent.data)

        if (json.type === 'ready') {
          webViewReady.current = true

          for (let message of webViewQueue.current) {
            postMessage(message)
          }
          webViewQueue.current = []
        } else if (json.type === 'ot') {
          otClient.sendOps(json.payload)
        } else if (json.type === 'log') {
          console.log('[webview log]', json.payload)
        }
      },
      [otClient]
    )

    useEffect(() => {
      if (otClient) {
        const otListener = (ops) => {
          postMessage({
            type: 'ot',
            payload: ops
          })
        }

        const replaceListener = (content) => {
          postMessage({
            type: 'replace',
            payload: content
          })
        }

        otClient.on('ot', otListener)
        otClient.on('replace', replaceListener)

        return () => {
          otClient.off('ot', otListener)
          otClient.off('replace', replaceListener)
        }
      }
    }, [otClient])

    useEffect(() => {
      postMessage({
        type: 'config',
        payload: {
          path,
          canWrite,
          dark: theme.dark,
          softWrapping: context.softWrapping,
          indentSize: context.indentSize,
          softTabs: context.softTabs
        }
      })
    }, [
      canWrite,
      context.indentSize,
      context.softTabs,
      context.softWrapping,
      context.theme,
      path,
      theme.dark
    ])

    return (
      <View
        style={{
          flex: 1,
          display: otClient ? 'flex' : 'none'
        }}
      >
        <Theme>
          {source ? (
            <WebView
              useWebKit
              originWhitelist={['*']}
              source={{ html: source }}
              ref={webView}
              onMessage={onMessage}
            />
          ) : (
            <ActivityIndicator />
          )}
        </Theme>
      </View>
    )
  })
)
