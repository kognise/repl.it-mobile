import React, { Component } from 'react'
import { View } from 'react-native'
import Editor from '../components/Editor'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Repl.it') 
  })

  render() {
    return (
      <View>
        <Editor />
      </View>
    )
  }
}