import React, { Component } from 'react'
import { View } from 'react-native'
import Repls from '../components/Repls'

export default class extends Component {
  static navigationOptions = {
    title: 'Your Repls'
  }

  render() {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Repls />
      </View>
    )
  }
}