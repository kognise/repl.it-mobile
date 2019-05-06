import React, { Component } from 'react'
import { View } from 'react-native'
import { isLoggedIn } from '../lib/network'
import ActivityIndicator from '../components/ActivityIndicator'
import Theme from '../components/Theme'

export default class extends Component {
  render() {
    return (
      <Theme>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator />
        </View>
      </Theme>
    )
  }

  async componentDidMount() {
    const loggedIn = await isLoggedIn()
    this.props.navigation.navigate(loggedIn ? 'App' : 'Auth')
  }
}