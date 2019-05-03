import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import ActivityIndicator from './ActivityIndicator'
import { fetchRepls, fetchFolders } from '../lib/network'

export default class extends Component {
  state = {
    repls: [],
    folders: [],
    loading: true,
    refreshing: false
  }
  pageInfo = {}

  render() {
    return (
      <ScrollView
        scrollEventThrottle={16}
        onScroll={this.onScroll}
        onMomentumScrollEnd={this.onScroll}
        refreshControl={
          <RefreshControl
            refreshing={this.state.refreshing}
            onRefresh={this.refresh}
          />
        }
        contentContainerStyle={{ flex: 1 }}
      >
        {this.state.folders.map((folder) => (
          <List.Item
            title={folder.name}
            key={folder.id}
            onPress={() => this.props.onFolderPress(folder)}
            left={(props) => <List.Icon {...props} icon='folder' />}
          />
        ))}
        {this.state.repls.map((repl) => (
          <List.Item
            title={repl.title}
            description={`A ${repl.language} repl`}
            key={repl.id}
            onPress={() => this.props.onReplPress(repl)}
            left={(props) => <List.Icon {...props} icon='insert-drive-file' />}
          />
        ))}
        {this.state.loading && <ActivityIndicator />}
      </ScrollView>
    )
  }

  async componentDidMount() {
    this.mounted = true

    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId)
    const folders = await fetchFolders(this.props.folderId)
    this.pageInfo = pageInfo
    if (!this.mounted) return

    this.setState({
      repls: items,
      loading: false,
      folders
    })
  }
  componentWillUnmount() {
    this.mounted = false
  }

  refresh = async () => {
    this.setState({ refreshing: true })

    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId)
    const folders = await fetchFolders(this.props.folderId)
    if (!this.mounted) return
    this.pageInfo = pageInfo

    this.setState({
      repls: items,
      refreshing: false,
      folders
    })
  }
  reload = async () => {
    this.setState({
      repls: [],
      folders: [],
      loading: true
    })
    
    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId)
    const folders = await fetchFolders(this.props.folderId)
    this.pageInfo = pageInfo
    if (!this.mounted) return

    this.setState({
      repls: items,
      loading: false,
      folders
    })
  }
  onScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 60) {
      this.loadMore()
    }
  }

  async loadMore() {
    if (this.state.loading) return
    if (!this.pageInfo.hasNextPage) return

    this.setState({ loading: true })
    const { items, pageInfo } = await fetchRepls(this.pageInfo.nextCursor, this.props.folderId)
    if (!this.mounted) return
    this.pageInfo = pageInfo

    this.setState({
      repls: this.state.repls.concat(items),
      loading: false
    })
  }
}