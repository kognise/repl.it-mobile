import React, { Component } from 'react'
import { Constants } from 'expo'
import { ActivityIndicator as NActivityIndicator } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'

export default class extends Component {
  render() {
    return Constants.platform === 'android'
      ? <ActivityIndicator style={{ margin: 20 }} />
      : <NActivityIndicator style={{ margin: 16 }} />
  }
}