import React, { Component } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Repl.it')
  })

  render() {
    return (
      <View>
        <Text>Hi!</Text>
      </View>
    )
  }
}