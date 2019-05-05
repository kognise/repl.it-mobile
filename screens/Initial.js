import React, { Component } from 'react'
import { View } from 'react-native'
import { isLoggedIn } from '../lib/network'
import ActivityIndicator from '../components/ActivityIndicator'

export default class extends Component {
  render() {
    return (
      <View style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ActivityIndicator />
      </View>
    )
  }

  async componentDidMount() {
    const loggedIn = await isLoggedIn()
    this.props.navigation.navigate(loggedIn ? 'App' : 'Auth')
  }
}