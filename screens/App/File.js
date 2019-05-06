import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu, Paragraph } from 'react-native-paper'
import ActivityIndicator from '../../components/ActivityIndicator'
import { getUrls, readFile, writeFile, deleteFile } from '../../lib/network'
import TabView from '../../components/TabView'
import Editor from '../../components/Editor'
import Theme from '../../components/Theme'

class EditorScene extends Component {
  state = {
    code: undefined,
    path: undefined,
    loading: true
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
  saveCode = async (code) => await writeFile(this.urls, code)
}

class ConsoleScene extends Component {
  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          <Paragraph>
            We're really sorry, but the console view isn't implemented yet! Kognise is working on it while you read this.
          </Paragraph>
        </View>
      </Theme> 
    )
  }
}

class WebScene extends Component {
  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          <Paragraph>
            We're really sorry, but the web view isn't implemented yet! Kognise is working on it while you read this.
          </Paragraph>
        </View>
      </Theme> 
    )
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
    )
  })

  state = {
    index: 0,
    routes: [
      { key: 'editor', title: 'Code' },
      { key: 'console', title: 'Console' }
    ]
  }
  scenes = {
    editor: this.EditorScene,
    web: this.OutputScene,
    console: this.OutputScene
  }

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

    this.scenes = {
      editor: () => <EditorScene id={id} path={path} />,
      console: () => <ConsoleScene />
    }
    if (language === 'html') {
      this.state.routes[2] = this.state.routes[1]
      this.state.routes[1] = { key: 'web', title: 'Web' }
      this.scenes.web = () => <WebScene id={id} />
    }
  }
  updateIndex = (index) => this.setState({ index })
}