import React, { Component } from 'react'
import { ScrollView } from 'react-native'
import { List, ActivityIndicator } from 'react-native-paper'
import { fetchDashboard } from '../lib/network'

export default class extends Component {
  state = {
    items: null
  }

  render() {
    if (!this.state.items) {
      return <ActivityIndicator />
    }

    return (
      <ScrollView>
        {this.state.items.map(({ id, title, language }) => (
          <List.Item
            title={title}
            description={`A ${language} repl`}
            key={id}
          />
        ))}
      </ScrollView>
    )
  }

  async componentDidMount() {
    const items = await fetchDashboard()
    this.setState({ items })
  }
}