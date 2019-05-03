import React, { Component } from 'react'
import { View } from 'react-native'
import ActivityIndicator from '../../components/ActivityIndicator'
import { getUrls, readFile, writeFile } from '../../lib/network'
import Editor from '../../components/Editor'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('path', 'File') 
  })

  state = {
    code: undefined,
    path: undefined,
    loading: true
  }

  render() {
    return (
      <View>
        {this.state.loading && <ActivityIndicator />}
        <Editor
          hidden={this.state.loading}
          code={this.state.code}
          path={this.state.path}
          onChange={this.saveCode}
        />
      </View>
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