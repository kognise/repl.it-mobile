import React, { Component } from 'react'
import { View } from 'react-native'
import ActivityIndicator from '../components/ActivityIndicator'
import { readFile } from '../lib/network'
import Editor from '../components/Editor'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Repl.it') 
  })

  state = {
    code: '',
    loading: true
  }

  render() {
    return (
      <View>
        {this.state.loading && <ActivityIndicator />}
        <Editor hidden={this.state.loading} code={this.state.code} />
      </View>
    )
  }

  async componentDidMount() {
    this.mounted = true
    this.id = this.props.navigation.getParam('id')
    const code = await readFile(this.id, 'index.js')
    if (!this.mounted) return
    this.setState({ code, loading: false })
  }
  componentWillUnmount() {
     this.mounted = false
  }
}