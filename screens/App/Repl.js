import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import { deleteRepl } from '../../lib/network'
import Files from '../../components/Files'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Files'),
    menu: (closeMenu) => (
      <Menu.Item
        title='Delete'
        onPress={async () => {
          closeMenu()
          const id = navigation.getParam('id')
          await deleteRepl(id)
          navigation.navigate('Dashboard', { reload: true })
        }}
      />
    )
  })

  render() {
    const { navigate } = this.props.navigation
    const id = this.props.navigation.getParam('id')
    const url = this.props.navigation.getParam('url')
    return (
      <View style={{ flex: 1 }}>
        <Files url={url} onPress={(path) => navigate('File', { id, path })} />
      </View>
    )
  }
}