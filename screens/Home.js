import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import Repls from '../components/Repls'

export default class extends Component {
  static navigationOptions = {
    title: 'Home'
  }

  render() {
    return (
      <View style={{ paddingVertical: 12 }}>
        <Repls />
      </View>
    )
  }
}

const styles = StyleSheet.create()