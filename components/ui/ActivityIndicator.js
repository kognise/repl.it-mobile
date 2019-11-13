import React, { Component } from 'react'
import { Platform, ActivityIndicator as NActivityIndicator } from 'react-native'
import { ActivityIndicator } from 'react-native-paper'

export default class extends Component {
  render() {
    return Platform.OS === 'android' ? (
      <ActivityIndicator style={{ margin: 20 }} />
    ) : (
      <NActivityIndicator style={{ margin: 16 }} />
    )
  }
}
