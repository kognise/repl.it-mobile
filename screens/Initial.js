import React, { Component } from 'react'
import { View } from 'react-native'
import { isLoggedIn } from '../lib/network'
import { resetAndNavigate } from '../lib/navigation'
import ActivityIndicator from '../components/ActivityIndicator'

export default class extends Component {
  static navigationOptions = {
    header: null
  }

  render() {
    const { navigate } = this.props.navigation
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
    if (loggedIn) {
      resetAndNavigate(this.props.navigation, 'Home')
    } else {
      resetAndNavigate(this.props.navigation, 'Welcome')
    }
  }
}