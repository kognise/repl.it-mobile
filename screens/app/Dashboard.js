import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu, Searchbar } from 'react-native-paper'

import { navigateSame } from '../../lib/navigation'
import NewRepl from '../../components/dialogButtons/fabs/NewRepl'
import NewFolder from '../../components/dialogButtons/menuItems/NewFolder'
import DeleteFolder from '../../components/dialogButtons/menuItems/DeleteFolder'
import Theme from '../../components/wrappers/Theme'
import Dashboard from '../../components/lists/Dashboard'

export default class extends Component {
  static navigationOptions = ({ navigation }) => {
    const root = !navigation.getParam('name')
    return {
      title: navigation.getParam('name', 'Your Repls'),
      menu: (closeMenu) => (
        <>
          <NewFolder
            closeMenu={closeMenu}
            id={navigation.getParam('folderId')}
            navigation={navigation}
          />
          {navigation.getParam('name') !== 'Unnamed' && !root ? (
            <DeleteFolder
              closeMenu={closeMenu}
              id={navigation.getParam('folderId')}
              navigation={navigation}
            />
          ) : null}
          {root ? (
            <Menu.Item
              title="Settings"
              onPress={() => {
                closeMenu()
                navigation.navigate('Settings')
              }}
            />
          ) : null}
        </>
      )
    }
  }

  state = {
    search: ''
  }

  render() {
    const { navigate, getParam } = this.props.navigation
    const folderId = getParam('folderId')

    return (
      <Theme>
        <View style={{ padding: 10 }}>
          <Searchbar
            placeholder="Search"
            onChangeText={this.updateSearch}
            onSubmitEditing={this.performSearch}
            value={this.state.search}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Dashboard
            folderId={folderId}
            onFolderPress={({ id, name }) =>
              navigateSame(this.props.navigation, { folderId: id, reload: this.reload, name })
            }
            onReplPress={({ id, title, url, language, canWrite }) =>
              navigate('Repl', { id, title, url, language, canWrite, reload: this.reload })
            }
            reload={this.reload}
            navigate={navigate}
            ref={(dashboard) => (this.dashboard = dashboard)}
          />
          <NewRepl folderId={folderId} reload={this.reload} navigate={navigate} />
        </View>
      </Theme>
    )
  }

  componentWillMount() {
    this.props.navigation.setParams({ reloadThis: this.reload })
  }

  updateSearch = (search) => {
    this.setState({ search }, () => {
      if (search === '') this.performSearch()
    })
  }
  performSearch = async () => this.dashboard && (await this.dashboard.search(this.state.search))
  reload = async () => this.dashboard && (await this.dashboard.reload())
}
