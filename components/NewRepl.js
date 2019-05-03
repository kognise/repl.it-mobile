import React, { Component } from 'react'
import { FAB } from 'react-native-paper'

export default class extends Component {
  render() {
    return (
      <FAB
        style={{
          position: 'absolute',
          margin: 16,
          right: 0,
          bottom: 0
        }}
        icon='add'
        onPress={() => console.log('Time to make a new repl!')}
      />
    )
  }
}