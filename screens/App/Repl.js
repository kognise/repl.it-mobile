import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu } from 'react-native-paper'
import { NavigationEvents } from 'react-navigation'
import { deleteRepl } from '../../lib/network'
import NewFile from '../../components/NewFile'
import Files from '../../components/Files'
import Theme from '../../components/Theme'

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
    const language = getParam('language')
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          <Files
            url={url}
            onPress={(path) => navigate('File', { id, path, language, reload: this.reload })}
            ref={(files) => this.files = files}
          />
          <NewFile id={id} reload={this.reload} navigate={navigate} />
          <NavigationEvents onDidFocus={this.didFocus} />
        </View>
      </Theme>
    )
  }
  reload = async () => this.files && await this.files.reload()
}