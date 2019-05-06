import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import ActivityIndicator from './ActivityIndicator'
import moisten from '../lib/moisten'
import { fetchFiles } from '../lib/network'
import Theme from '../components/Theme'

function renderFiles(files, onPress) {
  const children = []
  for (let name in files) {
    const file = files[name]
    if (file.type === 'file') {
      children.push(
        <List.Item
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon='insert-drive-file' />}
          onPress={() => onPress(file.path)}
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
      <Theme>
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
      </Theme>
    )
  }

  async componentDidMount() {
    this.mounted = true

    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return
    
    this.setState({ files, loading: false })
  }
  componentWillUnmount() {
    this.mounted = false
  }

  refresh = async () => {
    this.setState({ refreshing: true })

    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return

    this.setState({ files, refreshing: false })
  }
  reload = async () => {
    this.setState({ files: {}, loading: true })
    
    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return

    this.setState({ files, loading: false })
  }
}