import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu, Searchbar } from 'react-native-paper'
import { navigateSame } from '../../lib/navigation'

import Theme from '../../components/Theme'
import NewRepl from '../../components/NewRepl'
import Dashboard from '../../components/Dashboard'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('name', 'Your Repls'),
    menu: (closeMenu) => (
      <Menu.Item
        title='Settings'
        onPress={() => {
          closeMenu()
          navigation.navigate('Settings')
        }}
      />
    )
  })

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
            placeholder='Search'
            onChangeText={this.updateSearch}
            onSubmitEditing={this.performSearch}
            value={this.state.search}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Dashboard
            folderId={folderId}
            onFolderPress={({ id, name }) => navigateSame(this.props.navigation, { folderId: id, name })}
            onReplPress={({ id, title, url, language, canWrite }) => navigate('Repl', { id, title, url, language, canWrite, reload: this.reload })}
            reload={this.reload}
            navigate={navigate}
            ref={(dashboard) => this.dashboard = dashboard}
          />
          <NewRepl folderId={folderId} reload={this.reload} navigate={navigate} />
        </View>
      </Theme>
    )
  }

  componentDidMount() {
    this.props.navigation.navigate('LoadRepl', {
      url: '/@Kognise/useless-bot',
      reload: this.reload
    })
  }
  updateSearch = (search) => {
    this.setState({ search }, () => {
      if (search === '') this.performSearch()
    })
  }
  performSearch = async () => this.dashboard && await this.dashboard.search(this.state.search)
  reload = async () => this.dashboard && await this.dashboard.reload()
}