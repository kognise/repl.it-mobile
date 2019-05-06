import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
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

class OutputScene extends Component {
  render() {
    return (
      <Theme>
        <View style={{ flex: 1 }}>
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
      { key: 'output', title: 'Output' }
    ]
  }

  render() {
    return (
      <TabView
        state={this.state}
        scenes={{
          editor: this.EditorScene,
          output: this.OutputScene
        }}
        onIndexChange={this.updateIndex}
      />
    )
  }

  async componentWillMount() {
    const id = this.props.navigation.getParam('id')
    const path = this.props.navigation.getParam('path')

    this.EditorScene = () => (
      <EditorScene id={id} path={path} />
    )
    this.OutputScene = () => (
      <OutputScene />
    )
  }
  updateIndex = (index) => this.setState({ index })
}