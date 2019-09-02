import React, { Component } from 'react'
import { View } from 'react-native'

export default class extends Component {
  render() {
    return (
      <View
        style={{
          ...this.props.style,
          flexDirection: 'row'
        }}
      >
        {this.props.children}
      </View>
    )
  }
}
