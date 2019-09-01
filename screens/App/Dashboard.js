import React, { Component } from 'react'
import { View } from 'react-native'
import { Menu, Searchbar, Dialog, Portal, Text, Button, withTheme } from 'react-native-paper'

import { navigateSame } from '../../lib/navigation'
import { deleteFolder } from '../../lib/network'

import Theme from '../../components/Theme'
import NewRepl from '../../components/NewRepl'
import Dashboard from '../../components/Dashboard'

const DeleteFolder = withTheme(class extends Component {
  state = {
    dialogOpen: false,
    loading: false,
    error: null
  }

  render() {
    return (<>
      <Menu.Item
        title='Delete'
        onPress={this.open}
      />

      <Portal>
        <Dialog visible={this.state.dialogOpen} onDismiss={this.cancel}>
          <Dialog.Title>Are you sure?</Dialog.Title>

          <Dialog.Content>
            {this.state.error && (
              <Text style={{
                color: this.props.theme.colors.error,
                marginBottom: 10
              }}>
                {this.state.error}
              </Text>
            )}

            <Text>
              Are you sure you want to delete this folder?
              All the repls it contains will be deleted forever.
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            <Button
              onPress={this.cancel}
              disabled={this.state.loading}
            >
              Cancel
            </Button>
            <Button
              onPress={this.delete}
              loading={this.state.loading}
              disabled={this.state.loading}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>)
  }

  open = () => this.setState({ dialogOpen: true })
  cancel = () => {
    this.setState({
      dialogOpen: false,
      loading: false,
      error: null
    })
    this.props.closeMenu()
  }

  delete = async () => {
    this.setState({ loading: true })
    try {
      await deleteFolder(this.props.id)
      if (!this.state.dialogOpen) return
      const reload = this.props.navigation.getParam('reload')

      reload()
      this.props.navigation.goBack()
    } catch(error) {
      if (!this.state.dialogOpen) return
      this.setState({
        error: error.message,
        loading: false
      })
    }
  }
})

export default class extends Component {
  static navigationOptions = ({ navigation }) => {
    const root = !navigation.getParam('name')
    return {
      title: navigation.getParam('name', 'Your Repls'),
      menu: (closeMenu) => (<>
        <Menu.Item
          title='New folder'
          onPress={() => {
            closeMenu()
          }}
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
            title='Settings'
            onPress={() => {
              closeMenu()
              navigation.navigate('Settings')
            }}
          />
        ) : null}
      </>)
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
            placeholder='Search'
            onChangeText={this.updateSearch}
            onSubmitEditing={this.performSearch}
            value={this.state.search}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Dashboard
            folderId={folderId}
            onFolderPress={({ id, name }) => navigateSame(this.props.navigation, { folderId: id, reload: this.reload, name })}
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

  updateSearch = (search) => {
    this.setState({ search }, () => {
      if (search === '') this.performSearch()
    })
  }
  performSearch = async () => this.dashboard && await this.dashboard.search(this.state.search)
  reload = async () => this.dashboard && await this.dashboard.reload()
}