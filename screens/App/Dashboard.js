import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import { NavigationEvents } from 'react-navigation'
import { navigateSame } from '../../lib/navigation'
import { logOut } from '../../lib/network'
import NewRepl from '../../components/NewRepl'
import Dashboard from '../../components/Dashboard'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('name', 'Your Repls'),
    menu: (closeMenu) => (
      <Menu.Item
        title='Log out'
        onPress={async () => {
          closeMenu()
          await logOut()
          navigation.navigate('Auth')
        }}
      />
    )
  })

  render() {
    const { navigate, getParam } = this.props.navigation
    const folderId = getParam('folderId')
    return (
      <View style={{ flex: 1 }}>
        <Dashboard
          folderId={folderId}
          onFolderPress={({ id, name }) => navigateSame(this.props.navigation, { folderId: id, name })}
          onReplPress={({ id, title, url }) => navigate('Repl', { id, title, url })}
          ref={(dashboard) => this.dashboard = dashboard}
        />
        <NewRepl folderId={folderId} navigation={this.props.navigation} />
        <NavigationEvents onDidFocus={this.didFocus} />
      </View>
    )
  }

  didFocus = () => {
    const shouldReload = this.props.navigation.getParam('reload')
    this.props.navigation.setParams({ reload: false })
    if (shouldReload) this.reload()
  }
  reload = async () => this.dashboard && await this.dashboard.reload()
}