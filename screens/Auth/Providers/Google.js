import React, { Component } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'

export default class extends Component {
  static navigationOptions = {
    title: 'Google'
  }

  state = {
    loading: false
  }

  render() {
    return (
      <View>
        <Text>Yeet! Google login isn't implemented yet :smirk:</Text>
      </View>
    )
  }
}