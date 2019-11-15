import React, { Component } from 'react'
import { withTheme } from 'react-native-paper'
import shadow from 'react-native-paper/lib/module/styles/shadow'
import overlay from 'react-native-paper/lib/module/styles/overlay'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'

export default withTheme(
  class extends Component {
    render() {
      return (
        <TabView
          navigationState={this.props.state}
          renderScene={SceneMap(this.props.scenes)}
          onIndexChange={this.props.onIndexChange}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={{ backgroundColor: 'white' }}
              style={{
                backgroundColor: overlay(4, this.props.theme.colors.surface),
                ...shadow(4)
              }}
            />
          )}
        />
      )
    }
  }
)
