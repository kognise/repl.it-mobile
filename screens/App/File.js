import React, { Component } from 'react'

import consoleBridge from '../../lib/consoleBridge'
import { View, ScrollView, RefreshControl, Image } from 'react-native'
import { WebView } from 'react-native-webview'
import { Menu, Text, withTheme } from 'react-native-paper'
import { getUrls, readFile, writeFile, deleteFile, getWebUrl } from '../../lib/network'

import ActivityIndicator from '../../components/ActivityIndicator'
import TabView from '../../components/TabView'
import Editor from '../../components/Editor'
import Theme from '../../components/Theme'

const imageExtensions = [ 'png', 'jpg', 'jpeg', 'bmp', 'gif' ]
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
          />
          <Text style={{
            position: 'absolute',
            bottom: 10,
            left: 10
          }}>
            {this.state.saving ? 'Saving...' : 'Saved'}
          </Text>
        </View>
      </Theme> 
    )
  }

  async componentDidMount() {
    this.mounted = true

    const { id, path } = this.props
    const urls = await getUrls(id, path)
    const code = await readFile(urls)

    if (!this.mounted) return
    this.urls = urls
    this.setState({ code, path, loading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }
  saveCode = async (code) => {
    this.setState({ saving: true })
    await writeFile(this.urls, code)
    this.setState({ saving: false })
  }
}

class ImageScene extends Component {
  state = {
    url: undefined,
    loading: true
  }

  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          {this.state.loading ? <ActivityIndicator /> : (
            <Image
              source={{ uri: this.state.url }}
              style={{ flex: 1, resizeMode: 'center' }}
            />
          )}
        </View>
      </Theme> 
    )
  }

  async componentDidMount() {
    this.mounted = true

    const { id, path } = this.props
    const urls = await getUrls(id, path)

    if (!this.mounted) return
    this.setState({ url: urls.read, loading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }
}

const ConsoleScene = withTheme(class extends Component {
  state = {
    messages: []
  }

  render() {
    return (
      <Theme>
        <ScrollView style={{ minHeight: '100%' }}>
          {this.state.messages.map(({ message, error }, index) => (
            <Text style={{
              fontFamily: 'inconsolata',
              fontSize: 18,
              color: error ? this.props.theme.colors.error : this.props.theme.colors.text
            }} selectable key={index}>
              {message}
            </Text>
          ))}
        </ScrollView>
      </Theme> 
    )
  }

  appendMessage(message, error) {
    this.setState((prevState) => ({
      messages: [ ...prevState.messages, { message, error } ]
    }))
  }
})

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
            <RefreshControl
              refreshing={this.state.reloading}
              onRefresh={this.reload}
            />
          }
          contentContainerStyle={{ flex: 1 }}
        >
          {this.state.loading && <ActivityIndicator />}
          {!this.state.loading && <WebView
            style={{ backgroundColor: '#ffffff' }}
            useWebKit={true}
            originWhitelist={[ '*' ]}
            source={this.state.source}
            ref={(webView) => this.webView = webView}
            renderLoading={() => null}
            onLoadEnd={this.onLoadEnd}
            key={this.state.key}
            onMessage={this.onMessage}
          />}
        </ScrollView>
      </Theme> 
    )
  }

  async componentDidMount() {
    this.mounted = true

    const url = await getWebUrl(this.props.id)
    const res = await fetch(url)
    const html = consoleBridge + await res.text()

    if (!this.mounted) return
    this.setState({
      source: { baseUrl: url, html },
      loading: false
    })
  }
  reload = () => {
    this.setState({ reloading: true })
    this.webView && this.setState({ key: this.state.key + 1 })
  }
  onLoadEnd = () => {
    this.setState({ reloading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }
  onMessage = (event) => {
    const [ error, message ] = JSON.parse(event.nativeEvent.data)
    this.props.logMessage(message, error)
  }
}

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('path', 'File'),
    menu: (closeMenu) => (
      <Menu.Item
        title='Delete'
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
    ),
    hasAddon: true
  })

  state = {
    index: 0,
    routes: []
  }
  scenes = {}

  render() {
    return (
      <TabView
        state={this.state}
        scenes={this.scenes}
        onIndexChange={this.updateIndex}
      />
    )
  }

  async componentWillMount() {
    const id = this.props.navigation.getParam('id')
    const path = this.props.navigation.getParam('path')
    const language = this.props.navigation.getParam('language')

    if (isImage(path)) {
      this.state.routes = [
        { key: 'image', title: 'Image' }
      ]
      this.scenes = {
        image: () => <ImageScene id={id} path={path} />
      }
    } else {
      this.state.routes = [
        { key: 'editor', title: 'Code' }
      ]
      this.scenes = {
        editor: () => <EditorScene id={id} path={path} />
      }
    }

    if (language === 'html') {
      this.state.routes.push({ key: 'web', title: 'Web' })
      this.scenes.web = () => <WebScene id={id} logMessage={this.logMessage} />
    } else {
      this.logMessage('Sorry, running repls isn\'t currently supported! We\'re working on it.', true)
    }

    this.state.routes.push({ key: 'console', title: 'Console' })
    this.scenes.console = () => <ConsoleScene ref={this.consoleRef} />
  }

  logQueue = []
  consoleRef = (consoleScene) => {
    this.console = consoleScene
    if (this.logQueue.length > 0) {
      for (let [ message, error ] of this.logQueue) {
        consoleScene.appendMessage(message, error)
      }
      this.logQueue = []
    }
  }
  logMessage = (message, error) => {
    if (this.console) {
      this.console.appendMessage(message, error)
    } else {
      this.logQueue.push([ message, error ])
    }
  }

  updateIndex = (index) => {
    this.setState({ index })
  }
}