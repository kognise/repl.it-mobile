import React from 'react'
import { withTheme } from 'react-native-paper'
import shadow from 'react-native-paper/lib/module/styles/shadow'
import overlay from 'react-native-paper/lib/module/styles/overlay'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'

export default withTheme(({ state, scenes, onIndexChange, swipeEnabled, theme }) => {
  const backgroundColor =
    theme.dark && theme.mode === 'adaptive'
      ? overlay(theme.elevation, theme.colors.surface)
      : theme.colors.primary

  return (
    <TabView
      navigationState={state}
      renderScene={SceneMap(scenes)}
      onIndexChange={onIndexChange}
      swipeEnabled={swipeEnabled}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: 'white' }}
          style={{
            backgroundColor,
            ...shadow(4)
          }}
        />
      )}
    />
  )
})
