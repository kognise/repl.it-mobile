import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import { navigateSame } from '../../lib/navigation'
import { logOut } from '../../lib/network'
import Dashboard from '../../components/Dashboard'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('name', 'Your Repls'),
    menu: (
      <Menu.Item
        title='Log out'
        onPress={async () => {
          await logOut()
          navigation.navigate('Auth')
        }}
      />
    )
  })

  render() {
    const { navigate, getParam } = this.props.navigation
    return (
      <View>
        <Dashboard
          folderId={getParam('folderId')}
          onFolderPress={({ id, name }) => navigateSame(this.props.navigation, { folderId: id, name })}
          onReplPress={({ id, title, url }) => navigate('Repl', { id, title, url })}
        />
      </View>
    )
  }
}