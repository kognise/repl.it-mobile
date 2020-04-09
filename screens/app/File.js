import React, {
  Component,
  useImperativeHandle,
  useState,
  forwardRef,
  useRef,
  useEffect
} from 'react'
import * as WebBrowser from 'expo-web-browser'
import { View, ScrollView, SafeAreaView, RefreshControl, Image } from 'react-native'
import { WebView } from 'react-native-webview'
import { Menu, Button, Text } from 'react-native-paper'
import { SceneMap } from 'react-native-tab-view'
import { useNavigation } from 'react-navigation-hooks'
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

const Screen = () => {
  const navigation = useNavigation()
  const { navigate, getParam, setParams } = navigation

  const [index, setIndex] = useState(0)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [runnerState, setRunnerState] = useState('stopped')
  const [crosis, setCrosis] = useState(null)

  const renderScene = useRef(null)
  const runner = useRef(null)
  const consoleRef = useRef(null)
  const logQueue = useRef('')

  const consoleRefFunc = (consoleScene) => {
    consoleRef.current = consoleScene
    if (logQueue.current.length > 0) {
      consoleScene.appendToLog(logQueue.current)
      logQueue.current = ''
    }
  }

  const appendToLog = (content) => {
    if (consoleRef.current) {
      consoleRef.current.appendToLog(content)
    } else {
      logQueue.current += content
    }
  }

  const clearLog = () => {
    if (consoleRef.current) {
      consoleRef.current.clearLog()
    } else {
      logQueue.current = ''
    }
  }

  const indexFromKey = (key) => {
    return routes.findIndex((route) => route.key === key)
  }

  const runOrStop = async () => {
    if (indexFromKey('web') > -1) {
      setIndex(indexFromKey('web'))
      alert("I'm too lazy to reload the page so pull down to reload manually lol")
    } else {
      setIndex(indexFromKey('console'))

      if (runnerState === 'running' && runner.current) {
        await runner.current.clear()
        return
      } else {
        clearLog()
      }

      if (!runner.current) {
        runner.current = new Runner(crosis)
        runner.current.on('log', (message) => appendToLog(message))
        runner.current.on('state', (message) => setRunnerState(message))
      }

      await runner.current.install()
      await runner.current.run()
    }
  }

  useEffect(() => {
    ;(async () => {
      const id = getParam('id')
      const path = getParam('path')
      const language = getParam('language')
      const canWrite = getParam('canWrite')
      const crosis = getParam('crosis')

      const urls = await getUrls(id, path)

      const newRoutes = []
      const newScenes = {
        image: () => <ImageScene urls={urls} />,
        binary: () => <BinaryScene urls={urls} />,
        editor: () => <EditorScene crosis={crosis} canWrite={canWrite} urls={urls} path={path} />,
        web: () => <WebScene id={id} appendToLog={appendToLog} />,
        console: () => <ConsoleScene ref={consoleRefFunc} />
      }

      if (isImage(path)) {
        newRoutes.push({ key: 'image', title: 'Image' })
      } else if (await isFileBinary(urls)) {
        newRoutes.push({ key: 'binary', title: 'File' })
      } else {
        newRoutes.push({ key: 'editor', title: 'Code' })
      }

      if (language === 'web_project' || language === 'html') {
        newRoutes.push({ key: 'web', title: 'Web' })
      }
      newRoutes.push({ key: 'console', title: 'Console' })

      renderScene.current = SceneMap(newScenes)
      setCrosis(crosis)
      setRoutes(newRoutes)
      setLoading(false)
    })()

    return () => {
      if (runner.current) {
        runner.current.disconnect()
        runner.current = null
      }
    }
  }, [getParam])

  if (loading) {
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

  let fabIcon = 'exclamation'
  switch (runnerState) {
    case 'stopped': {
      fabIcon = 'play'
      break
    }
    case 'installing': {
      fabIcon = 'dots-horizontal'
      break
    }
    case 'running': {
      fabIcon = 'stop'
      break
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene.current}
        swipeEnabled={routes[index].key !== 'editor'}
        onIndexChange={setIndex}
      />
      <FAB icon={fabIcon} onPress={runOrStop} />
    </View>
  )
}

Screen.navigationOptions = ({ navigation }) => ({
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

export default Screen
