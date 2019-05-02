import React, { Component } from 'react'
import { View } from 'react-native'
import { navigateSame } from '../../lib/navigation'
import Dashboard from '../../components/Dashboard'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('name', 'Your Repls')
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