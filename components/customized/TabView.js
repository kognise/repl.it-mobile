import React, { Component } from 'react'
import { Platform } from 'react-native'
import { withTheme } from 'react-native-paper'
import shadow from 'react-native-paper/src/styles/shadow'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'

export default withTheme(class extends Component {
  render() {
    return (
      <TabView
        navigationState={this.props.state}
        renderScene={SceneMap(this.props.scenes)}
        onIndexChange={this.props.onIndexChange}
        swipeEnabled={false}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'white' }}
            style={{
              backgroundColor: this.props.theme.colors.appBar,
              ...shadow(Platform.OS === 'ios' ? 4 : 0)
            }}
          />
        )}
      />
    )
  }
})