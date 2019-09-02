import React, { Component } from 'react'
import * as WebBrowser from 'expo-web-browser'

import { View, ScrollView, RefreshControl, Image } from 'react-native'
import { WebView } from 'react-native-webview'
import { Menu, Button, Text, withTheme } from 'react-native-paper'
import consoleBridge from '../../lib/consoleBridge'
import {
  getUrls,
  readFile,
  isFileBinary,
  writeFile,
  deleteFile,
  getWebUrl
} from '../../lib/network'

import ActivityIndicator from '../../components/customized/ActivityIndicator'
import TabView from '../../components/customized/TabView'
import Editor from '../../components/webViews/Editor'
import Theme from '../../components/wrappers/Theme'

const imageExtensions = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
function isImage(file) {
  for (let extension of imageExtensions) {
    if (file.endsWith(`.${extension}`)) {
      return true
    }
  }
  return false
}

class EditorScene extends Component {
  state = {
    code: undefined,
    path: undefined,
    loading: true,
    saving: false
  }

  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          {this.state.loading && <ActivityIndicator />}
          <Editor
            hidden={this.state.loading}
            code={this.state.code}
            path={this.state.path}
            onChange={this.saveCode}
            canWrite={this.props.canWrite}
          />
          <Text
            style={{
              position: 'absolute',
              bottom: 10,
              left: 10
            }}
          >
            {this.state.saving ? 'Saving...' : 'Saved'}
          </Text>
        </View>
      </Theme>
    )
  }

  componentDidMount() {
    this.mounted = true
    this.load()
  }
  componentWillUnmount() {
    this.mounted = false
  }

  load = async () => {
    const { path, urls } = this.props
    const code = await readFile(urls)

    if (!this.mounted) return
    this.urls = urls
    this.setState({ code, path, loading: false })
  }
  saveCode = async (code) => {
    this.setState({ saving: true })
    await writeFile(this.urls, code)
    this.setState({ saving: false })
  }
}

class ImageScene extends Component {
  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          <Image source={{ uri: this.props.urls.read }} style={{ flex: 1, resizeMode: 'center' }} />
        </View>
      </Theme>
    )
  }
}

class BinaryScene extends Component {
  render() {
    return (
      <Theme>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 18,
              padding: 16,
              textAlign: 'center',
              marginBottom: 10
            }}
          >
            This is a binary file and can't be displayed in Repl.it mobile.
          </Text>
          <Button mode="contained" onPress={this.download}>
            Download
          </Button>
        </View>
      </Theme>
    )
  }

  download = async () => await WebBrowser.openBrowserAsync(this.props.urls.read)
}

const ConsoleScene = withTheme(
  class extends Component {
    state = {
      messages: []
    }

    render() {
      return (
        <Theme>
          <ScrollView style={{ minHeight: '100%' }}>
            {this.state.messages.map(({ message, error }, index) => (
              <Text
                style={{
                  fontFamily: 'Inconsolata',
                  fontSize: 18,
                  color: error ? this.props.theme.colors.error : this.props.theme.colors.text
                }}
                selectable
                key={index}
              >
                {message}
              </Text>
            ))}
          </ScrollView>
        </Theme>
      )
    }

    appendMessage(message, error) {
      this.setState((prevState) => ({
        messages: [...prevState.messages, { message, error }]
      }))
    }
  }
)

class WebScene extends Component {
  state = {
    source: {},
    loading: true,
    reloading: false,
    key: 0
  }

  render() {
    return (
      <Theme>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={this.state.reloading} onRefresh={this.reload} />
          }
          contentContainerStyle={{ flex: 1 }}
        >
          {this.state.loading && <ActivityIndicator />}
          {!this.state.loading && (
            <WebView
              style={{ backgroundColor: '#ffffff' }}
              useWebKit
              originWhitelist={['*']}
              source={this.state.source}
              ref={(webView) => (this.webView = webView)}
              renderLoading={() => null}
              onLoadEnd={this.onLoadEnd}
              key={this.state.key}
              onMessage={this.onMessage}
            />
          )}
        </ScrollView>
      </Theme>
    )
  }

  componentDidMount() {
    this.mounted = true
    this.load()
  }
  load = async () => {
    const url = await getWebUrl(this.props.id)
    const res = await fetch(url)
    const html = consoleBridge + (await res.text())

    if (!this.mounted) return
    this.setState({
      source: { baseUrl: url, html },
      loading: false
    })
  }

  reload = () => {
    this.setState({ reloading: true })
    this.webView.injectJavaScript(`window.location.href = '${this.state.source.baseUrl}'`)
  }
  onLoadEnd = () => {
    this.setState({ reloading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }
  onMessage = (event) => {
    const [error, message] = JSON.parse(event.nativeEvent.data)
    this.props.logMessage(message, error)
  }
}

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('path', 'File'),
    menu: navigation.getParam('canWrite')
      ? (closeMenu) => (
          <Menu.Item
            title="Delete"
            onPress={async () => {
              closeMenu()

              const id = navigation.getParam('id')
              const path = navigation.getParam('path')
              const reload = navigation.getParam('reload')

              const urls = await getUrls(id, path)
              await deleteFile(urls)

              reload()
              navigation.goBack()
            }}
          />
        )
      : null,
    hasAddon: true
  })

  state = {
    index: 0,
    routes: [],
    loading: true
  }
  scenes = {}

  render() {
    if (this.state.loading) {
      return (
        <Theme>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ActivityIndicator />
          </View>
        </Theme>
      )
    }
    return <TabView state={this.state} scenes={this.scenes} onIndexChange={this.updateIndex} />
  }

  async componentWillMount() {
    const id = this.props.navigation.getParam('id')
    const path = this.props.navigation.getParam('path')
    const language = this.props.navigation.getParam('language')
    const canWrite = this.props.navigation.getParam('canWrite')

    const urls = await getUrls(id, path)
    const newState = this.state

    if (isImage(path)) {
      newState.routes = [{ key: 'image', title: 'Image' }]
      this.scenes = {
        image: () => <ImageScene urls={urls} />
      }
    } else if (await isFileBinary(urls)) {
      newState.routes = [{ key: 'binary', title: 'File' }]
      this.scenes = {
        binary: () => <BinaryScene urls={urls} />
      }
    } else {
      newState.routes = [{ key: 'editor', title: 'Code' }]
      this.scenes = {
        editor: () => <EditorScene canWrite={canWrite} urls={urls} path={path} />
      }
    }

    if (language === 'html') {
      newState.routes.push({ key: 'web', title: 'Web' })
      this.scenes.web = () => <WebScene id={id} logMessage={this.logMessage} />
    } else {
      this.logMessage("Sorry, running repls isn't currently supported! We're working on it.", true)
    }

    newState.routes.push({ key: 'console', title: 'Console' })
    this.scenes.console = () => <ConsoleScene ref={this.consoleRef} />

    newState.loading = false
    this.setState(newState)
  }

  logQueue = []
  consoleRef = (consoleScene) => {
    this.console = consoleScene
    if (this.logQueue.length > 0) {
      for (let [message, error] of this.logQueue) {
        consoleScene.appendMessage(message, error)
      }
      this.logQueue = []
    }
  }
  logMessage = (message, error) => {
    if (this.console) {
      this.console.appendMessage(message, error)
    } else {
      this.logQueue.push([message, error])
    }
  }

  updateIndex = (index) => {
    this.setState({ index })
  }
}
