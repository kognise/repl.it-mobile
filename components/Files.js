import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import ActivityIndicator from './ActivityIndicator'
import { fetchFiles } from '../lib/network'

export default class extends Component {
  state = {
    files: [],
    loading: true,
    refreshing: false
  }

  render() {
    return (
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.refresh}
          />
        }
        contentContainerStyle={{ flex: 1 }}
      >
        {this.state.files.map((path) => (
          <List.Item
            title={path}
            key={path}
            onPress={() => this.props.onPress(path)}
          />
        ))}
        {this.state.loading && <ActivityIndicator />}
      </ScrollView>
    )
  }

  async componentDidMount() {
    this.mounted = true
    const files = await fetchFiles(this.props.url)
    this.setState({ files, loading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }

  refresh = async () => {
    this.setState({ refreshing: true })
    const files = await fetchFiles(this.props.url)
    if (!this.mounted) return
    this.setState({ files, refreshing: false })
  }
}