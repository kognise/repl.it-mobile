import React, { Component } from 'react'
import { View } from 'react-native'
import { isLoggedIn } from '../lib/network'

import ActivityIndicator from '../components/customized/ActivityIndicator'
import Theme from '../components/wrappers/Theme'

export default class extends Component {
  render() {
    return (
      <Theme>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
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
