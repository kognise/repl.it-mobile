import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'

import moisten from '../../lib/moisten'
import { fetchFiles } from '../../lib/network'

function renderFiles(files, onPress) {
  const children = []
  for (let name in files) {
    const file = files[name]
    if (file.type === 'file') {
      children.push(
        <List.Item
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon="insert-drive-file" />}
          onPress={() => onPress(file.path)}
        />
      )
    } else {
      children.push(
        <List.Accordion
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon="folder" />}
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
    loading: true
  }

  render() {
    return (
      <ScrollView
        refreshControl={<RefreshControl refreshing={this.state.loading} onRefresh={this.refresh} />}
        contentContainerStyle={{ minHeight: '100%' }}
      >
        {renderFiles(this.state.files, this.props.onPress)}
      </ScrollView>
    )
  }

  componentDidMount() {
    this.mounted = true
    this.load()
  }
  componentWillUnmount() {
    this.mounted = false
  }

  load = async () => {
    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return

    this.setState({ files, loading: false })
  }
  refresh = async () => {
    this.setState({ loading: true })

    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return

    this.setState({ files, loading: false })
  }
  reload = async () => {
    this.setState({ files: {}, loading: true })

    const flatFiles = await fetchFiles(this.props.url)
    const files = moisten(flatFiles)
    if (!this.mounted) return

    this.setState({ files, loading: false })
  }
}
