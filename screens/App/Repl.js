import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import { NavigationEvents } from 'react-navigation'
import { deleteRepl } from '../../lib/network'
import NewFile from '../../components/NewFile'
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
          const reload = navigation.getParam('reload')

          await deleteRepl(id)
          reload()
          navigation.goBack()
        }}
      />
    )
  })

  render() {
    const { navigate, getParam } = this.props.navigation
    const id = getParam('id')
    const url = getParam('url')
    return (
      <View style={{ flex: 1 }}>
        <Files
          url={url}
          onPress={(path) => navigate('File', { id, path, reload: this.reload })}
          ref={(files) => this.files = files}
        />
        <NewFile id={id} reload={this.reload} navigate={navigate} />
        <NavigationEvents onDidFocus={this.didFocus} />
      </View>
    )
  }

  // didFocus = () => {
  //   const shouldReload = this.props.navigation.getParam('reload')
  //   this.props.navigation.setParams({ reload: false })
  //   if (shouldReload) this.reload()
  // }
  reload = async () => this.files && await this.files.reload()
}