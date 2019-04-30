import React, { Component } from 'react'
import { List, ActivityIndicator } from 'react-native-paper'

const sid = 's%3AHKPDumQc3FQqRJzWkfwqO-qOWhqV3Nb_.S%2FxUZIFVaG7u6jKCnFwv7SNy0V1vMYQmYmyYeFhH778' // FIXME: REMOVE THIS!

export default class extends Component {
  state = {
    loading: true
  }

  render() {
    if (this.state.loading) {
      return <ActivityIndicator />
    } else {
      return <>
        <List.Item title='First item' />
      </>
    }
  }
}
  