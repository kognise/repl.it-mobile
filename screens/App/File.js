import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import ActivityIndicator from '../../components/ActivityIndicator'
import { getUrls, readFile, writeFile, deleteFile } from '../../lib/network'
import Editor from '../../components/Editor'
import Theme from '../../components/Theme'

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
    code: undefined,
    path: undefined,
    loading: true
  }

  render() {
    return (
      <Theme>
        <View>
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

    const id = this.props.navigation.getParam('id')
    const path = this.props.navigation.getParam('path')

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