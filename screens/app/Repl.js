import React, { Component } from 'react'
import { View, Clipboard, Platform, ToastAndroid } from 'react-native'
import { Menu } from 'react-native-paper'
import { NavigationEvents } from 'react-navigation'

import { navigateSame } from '../../lib/navigation'
import { deleteRepl, forkRepl } from '../../lib/network'
import NewFile from '../../components/dialogButtons/fabs/NewFile'
import Files from '../../components/lists/Files'
import Theme from '../../components/wrappers/Theme'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Files'),
    menu: (closeMenu) => (
      <>
        <Menu.Item
          title="Copy link"
          onPress={() => {
            closeMenu()
            const url = navigation.getParam('url')
            Clipboard.setString(`https://repl.it${url}`)
            if (Platform.OS === 'android') {
              ToastAndroid.show('Link copied', ToastAndroid.SHORT)
            }
          }}
        />
        <Menu.Item
          title="Fork"
          onPress={async () => {
            closeMenu()

            const id = navigation.getParam('id')
            const reloadPrevious = navigation.getParam('reloadPrevious')

            const newRepl = await forkRepl(id)
            reloadPrevious()
            navigateSame(navigation, {
              ...navigation.state.params,
              id: newRepl.id,
              title: newRepl.title,
              url: newRepl.url,
              language: newRepl.language,
              canWrite: true
            })
          }}
        />
        {navigation.getParam('canWrite') ? (
          <Menu.Item
            title="Delete"
            onPress={async () => {
              closeMenu()

              const id = navigation.getParam('id')
              const reloadPrevious = navigation.getParam('reloadPrevious')

              await deleteRepl(id)
              reloadPrevious()
              navigation.goBack()
            }}
          />
        ) : null}
      </>
    )
  })

  render() {
    const { navigate, getParam } = this.props.navigation
    const id = getParam('id')
    const url = getParam('url')
    const language = getParam('language')
    const canWrite = getParam('canWrite')
    return (
      <Theme>
        <View style={{ flex: 1 }}>
          <Files
            url={url}
            id={id}
            onPress={(path) =>
              navigate('File', { id, path, language, canWrite, reloadPrevious: this.reloadCurrent })
            }
            ref={(files) => (this.files = files)}
          />
          <NewFile id={id} reloadCurrent={this.reloadCurrent} navigate={navigate} />
          <NavigationEvents onDidFocus={this.didFocus} />
        </View>
      </Theme>
    )
  }
  reloadCurrent = async () => this.files && (await this.files.reload())
}
