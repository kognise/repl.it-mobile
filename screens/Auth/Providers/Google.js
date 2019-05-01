import React, { Component } from 'react'
import { View, Linking } from 'react-native'

export default class extends Component {
  static navigationOptions = {
    title: 'Google'
  }

  state = {
    loading: false
  }

  render() {
    return (
      <View />
    )
  }

  async componentDidMount() {
    Linking.openURL('https://google.com')
  }
}