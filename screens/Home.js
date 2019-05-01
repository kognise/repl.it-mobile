import React, { Component } from 'react'
import { View } from 'react-native'
import { IconButton } from 'react-native-paper'
import { resetAndNavigate } from '../lib/navigation'
import { logOut } from '../lib/network'
import Repls from '../components/Repls'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: 'Your Repls',
    headerRight: (
      <IconButton
        icon='exit-to-app'
        onPress={async () => {
          await logOut()
          resetAndNavigate(navigation, 'Welcome')
        }}
      />
    )
  })

  render() {
    const { navigate } = this.props.navigation
    return (
      <View>
        <Repls onPress={(id, title) => navigate('Repl', { id, title })} />
      </View>
    )
  }
}