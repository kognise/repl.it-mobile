import React, { Component } from 'react'
import { ScrollView, RefreshControl } from 'react-native'
import { List } from 'react-native-paper'
import ActivityIndicator from './ActivityIndicator'
import { fetchDashboard } from '../lib/network'

export default class extends Component {
  state = {
    items: [],
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
      >
        {this.state.items.map(({ id, title, language }) => (
          <List.Item
            title={title}
            description={`A ${language} repl`}
            key={id}
            onPress={() => this.props.onPress(id, title)}
          />
        ))}
        {this.state.loading && <ActivityIndicator />}
      </ScrollView>
    )
  }

  async componentDidMount() {
    this.mounted = true
    const { items, pageInfo } = await fetchDashboard()
    this.setState({ items, loading: false })
    this.pageInfo = pageInfo
  }
  componentWillUnmount() {
     this.mounted = false
  }

  refresh = async () => {
    this.setState({ refreshing: true })
    const { items, pageInfo } = await fetchDashboard()
    if (!this.mounted) return
    this.setState({ items, refreshing: false })
    this.pageInfo = pageInfo
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
    const { items, pageInfo } = await fetchDashboard(this.pageInfo.nextCursor)
    if (!this.mounted) return
    this.setState({
      items: this.state.items.concat(items),
      loading: false
    })
    this.pageInfo = pageInfo
  }
}