import React, { PureComponent } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import { fetchRepls, fetchFolders } from '../lib/network'

export default class extends PureComponent {
  state = {
    repls: [],
    folders: [],
    loading: true
  }
  pageInfo = {}
  search = ''

  render() {
    return (
      <ScrollView
        scrollEventThrottle={16}
        onScroll={this.onScroll}
        onMomentumScrollEnd={this.onScroll}
        refreshControl={
          <RefreshControl
            refreshing={this.state.loading}
            onRefresh={this.refresh}
          />
        }
        contentContainerStyle={{ minHeight: '100%' }}
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
      </ScrollView>
    )
  }

  async componentDidMount() {
    this.mounted = true

    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId, this.state.search)
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
    this.setState({ loading: true })

    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId, this.state.search)
    const folders = await fetchFolders(this.props.folderId)
    if (!this.mounted) return
    this.pageInfo = pageInfo

    this.setState({
      repls: items,
      loading: false,
      folders
    })
  }
  reload = async () => {
    this.setState({
      repls: [],
      folders: [],
      loading: true
    })
    
    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId, this.state.search)
    const folders = await fetchFolders(this.props.folderId)
    this.pageInfo = pageInfo
    if (!this.mounted) return

    this.setState({
      repls: items,
      loading: false,
      folders
    })
  }

  search = async (search) => {
    this.setState({
      repls: [],
      loading: true,
      search
    })
    
    const { items, pageInfo } = await fetchRepls(undefined, this.props.folderId, search)
    this.pageInfo = pageInfo
    if (!this.mounted) return

    this.setState({
      repls: items,
      loading: false
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
    const { items, pageInfo } = await fetchRepls(this.pageInfo.nextCursor, this.props.folderId, this.state.search)
    if (!this.mounted) return
    this.pageInfo = pageInfo

    this.setState({
      repls: this.state.repls.concat(items),
      loading: false
    })
  }
}