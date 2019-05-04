import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import ActivityIndicator from './ActivityIndicator'
import moisten from '../lib/moisten'
import { fetchFiles } from '../lib/network'

function renderFiles(files, onPress) {
  const children = []
  console.log(files)
  for (let name in files) {
    const file = files[name]
    if (file.type === 'file') {
      children.push(
        <List.Item
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon='insert-drive-file' />}
          onPress={() => onPress(path)}
        />
      )
    } else {
      children.push(
        <List.Accordion
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon='folder' />}
        >
          {renderFiles(file.content, onPress)}
        </List.Accordion>
      )
    }
  }
  return children
}

export default class extends Component {
  state = {
    files: {},
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
        contentContainerStyle={{ minHeight: '100%' }}
      >
        {renderFiles(this.state.files, this.props.onPress)}
        {this.state.loading && <ActivityIndicator />}
      </ScrollView>
    )
  }

  async componentDidMount() {
    this.mounted = true
    const flatFiles = await fetchFiles(this.props.url)
    if (!this.mounted) return
    const files = moisten(flatFiles)
    this.setState({ files, loading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }

  refresh = async () => {
    this.setState({ refreshing: true })
    const flatFiles = await fetchFiles(this.props.url)
    if (!this.mounted) return
    const files = moisten(flatFiles)
    this.setState({ files, refreshing: false })
  }
}