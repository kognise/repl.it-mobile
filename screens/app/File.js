import React, { Component, useImperativeHandle, useState, forwardRef } from 'react'
import * as WebBrowser from 'expo-web-browser'
import { View, ScrollView, SafeAreaView, RefreshControl, Image } from 'react-native'
import { WebView } from 'react-native-webview'
import { Menu, Button, Text } from 'react-native-paper'
import Anser from 'anser'

import OTClient from '../../lib/ot'
import consoleBridge from '../../lib/consoleBridge'
import { getUrls, isFileBinary, deleteFile, getWebUrl } from '../../lib/network'
import ActivityIndicator from '../../components/ui/ActivityIndicator'
import FAB from '../../components/ui/FAB'
import TabView from '../../components/ui/TabView'
import Editor from '../../components/webViews/Editor'
import Theme from '../../components/wrappers/Theme'
import Runner from '../../lib/runner'

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
    saving: false
  }

  otClient = new OTClient(this.props.crosis) // FIXME: flow blocking issues?

  render() {
    return (
      <Theme>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, display: 'flex' }}>
            <Editor
              otClient={this.otClient}
              path={this.props.path}
              canWrite={this.props.canWrite}
            />

            <Text
              style={{
                padding: 10
              }}
            >
              {this.state.saving ? 'Saving...' : 'Saved'}
            </Text>
          </View>
        </SafeAreaView>
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
    if (this.otClient.version === -1) {
      this.otClient.on('outgoing', this.debouncedSave)
      this.otClient.on('error', console.error)
      this.otClient.connect(this.props.path)
    }
  }

  ot = async (ops) => {
    await this.otClient.sendOps(ops)
  }

  saveTimeout = null
  debouncedSave = () => {
    // FIXME: this runs on an interval even if not updated
    clearTimeout(this.saveTimeout)

    this.saveTimeout = setTimeout(() => {
      this.saveTimeout = null
      this.save()
    }, 2000)

    if (!this.saveTimeout) this.save()
  }

  save = async () => {
    console.log('saving...')
    if (!this.mounted || this.saving) return
    this.setState({ saving: true })

    await this.otClient.channel.request({ flush: {} })
    await this.props.crosis.getChannel('snapshot').request({ fsSnapshot: {} })

    if (!this.mounted) return
    this.setState({ saving: false })
    console.log('flushed and took snapshot')
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
              onNavigationStateChange={(event) => console.log(`navigated to ${event.url}`)}
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
    console.log('reloading lmao')
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
    // TODO: add color for error
    const [error, message] = JSON.parse(event.nativeEvent.data)
    this.props.appendToLog((error ? `[error] ${message}` : message) + '\n')
  }
}

const ConsoleScene = forwardRef((_, ref) => {
  const [log, setLog] = useState([])

  useImperativeHandle(ref, () => ({
    appendToLog: (content) => {
      const parsed = Anser.ansiToJson(content.replace(/\uEEA7/g, '>'))
      setLog(log.concat(parsed))
    },
    clearLog: () => setLog([])
  }))

  return (
    <Theme>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1 }}>
          <Text>
            {log.map((chunk, index) => (
              <Text
                style={{
                  color: chunk.fg && `rgb(${chunk.fg})`,
                  backgroundColor: chunk.backgroundColor && `rgb(${chunk.bg})`,
                  fontFamily: 'Inconsolata',
                  fontSize: 18
                }}
                key={index}
              >
                {chunk.content}
              </Text>
            ))}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </Theme>
  )
})

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
              const reloadPrevious = navigation.getParam('reloadPrevious')

              const urls = await getUrls(id, path)
              await deleteFile(urls)

              reloadPrevious()
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
    loading: true,
    runnerState: 'stopped'
  }
  scenes = {}
  isWebRepl = false
  crosis = null
  runner = null

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
    return (
      <View style={{ flex: 1 }}>
        <TabView
          state={this.state}
          scenes={this.scenes}
          swipeEnabled={this.state.routes[this.state.index].key !== 'editor'}
          onIndexChange={this.updateIndex}
        />

        <FAB
          icon={
            this.state.runnerState === 'stopped'
              ? 'play'
              : this.state.runnerState === 'installing'
              ? 'dots-horizontal'
              : this.state.runnerState === 'running'
              ? 'stop'
              : 'exclamation'
          }
          onPress={this.runOrStop}
        />
      </View>
    )
  }

  runOrStop = async () => {
    if (this.isWebRepl) {
      this.setState({ index: this.indexFromKey('web') })
      alert("I'm too lazy to reload the page so pull down to reload manually lol")
    } else {
      this.setState({ index: this.indexFromKey('console') })

      if (this.state.runnerState === 'running' && this.runner) {
        await this.runner.clear()
        return
      } else {
        this.clearLog()
      }

      if (!this.runner) {
        this.runner = new Runner(this.crosis)
        this.runner.on('log', (message) => this.appendToLog(message))
        this.runner.on('state', (message) => this.setState({ runnerState: message }))
      }

      await this.runner.install()
      await this.runner.run()
    }
  }

  componentWillUnmount() {
    if (this.packager) this.packager.removeAllListeners()
    if (this.interp) this.interp.removeAllListeners()
  }

  async UNSAFE_componentWillMount() {
    const id = this.props.navigation.getParam('id')
    const path = this.props.navigation.getParam('path')
    const language = this.props.navigation.getParam('language')
    const canWrite = this.props.navigation.getParam('canWrite')
    const crosis = this.props.navigation.getParam('crosis')

    const urls = await getUrls(id, path)
    const newState = this.state
    this.isWebRepl = language === 'web_project' || language === 'html' // TODO: refactor

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
        editor: () => <EditorScene crosis={crosis} canWrite={canWrite} urls={urls} path={path} />
      }
    }

    if (this.isWebRepl) {
      newState.routes.push({ key: 'web', title: 'Web' })
      this.scenes.web = () => <WebScene id={id} appendToLog={this.appendToLog} />
    }

    newState.routes.push({ key: 'console', title: 'Console' })
    this.scenes.console = () => <ConsoleScene ref={this.consoleRef} />

    newState.loading = false
    this.crosis = crosis
    this.setState(newState)
  }

  indexFromKey(key) {
    return this.state.routes.findIndex((route) => route.key === key)
  }

  logQueue = ''
  consoleScene = null

  consoleRef = (consoleScene) => {
    this.consoleScene = consoleScene
    if (this.logQueue.length > 0) {
      consoleScene.appendToLog(this.logQueue)
      this.logQueue = ''
    }
  }

  appendToLog = (content) => {
    if (this.consoleScene) {
      this.consoleScene.appendToLog(content)
    } else {
      this.logQueue += content
    }
  }

  clearLog = () => {
    if (this.consoleScene) {
      this.consoleScene.clearLog()
    } else {
      this.logQueue = ''
    }
  }

  updateIndex = (index) => {
    this.setState({ index })
  }
}
