import React, { Component } from 'react'
import { View } from 'react-native'
import Repls from '../components/Repls'

export default class extends Component {
  static navigationOptions = {
    title: 'Your Repls'
  }

  render() {
    const { navigate } = this.props.navigation
    return (
      <View>
        <Repls onPress={(id, title) => navigate('Repl', { id, title })} />
      </View>
    )
  }
}