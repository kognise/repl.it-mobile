import React, { Component } from 'react'
import { View } from 'react-native'
import Files from '../../components/Files'

export default class extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: navigation.getParam('title', 'Files') 
  })

  render() {
    const { navigate } = this.props.navigation
    const id = this.props.navigation.getParam('id')
    const url = this.props.navigation.getParam('url')
    return (
      <View>
        <Files url={url} onPress={(path) => navigate('File', { id, path })} />
      </View>
    )
  }
}