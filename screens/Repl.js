import React, { Component } from 'react'
import { View } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'
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
    this.id = this.props.navigation.getParam('id')
    const code = await readFile(this.id, 'index.js')
    this.setState({ code, loading: false })
  }
}