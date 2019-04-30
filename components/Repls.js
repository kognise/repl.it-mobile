import React, { Component } from 'react'
import { ScrollView } from 'react-native'
import { List, ActivityIndicator } from 'react-native-paper'
import { fetchDashboard } from '../lib/network'

export default class extends Component {
  state = {
    items: [],
    loading: true
  }
  pageInfo = {}

  render() {
    return (
      <ScrollView
        scrollEventThrottle={16}
        onScroll={this.onScroll}
        onMomentumScrollEnd={this.onScroll}
      >
        {this.state.items.map(({ id, title, language }) => (
          <List.Item
            title={title}
            description={`A ${language} repl`}
            key={id}
            onPress={() => console.log('PRESSED!')}
          />
        ))}
        {this.state.loading && <ActivityIndicator />}
      </ScrollView>
    )
  }

  async componentDidMount() {
    const { items, pageInfo } = await fetchDashboard()
    this.setState({ items, loading: false })
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
    this.setState({
      items: this.state.items.concat(items),
      loading: false
    })
    this.pageInfo = pageInfo
  }
}