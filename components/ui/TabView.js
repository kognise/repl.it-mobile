import React from 'react'
import { withTheme } from 'react-native-paper'
import shadow from 'react-native-paper/lib/module/styles/shadow'
import overlay from 'react-native-paper/lib/module/styles/overlay'
import { TabView, TabBar } from 'react-native-tab-view'

export default withTheme(({ navigationState, renderScene, onIndexChange, swipeEnabled, theme }) => {
  const backgroundColor =
    theme.dark && theme.mode === 'adaptive'
      ? overlay(theme.elevation, theme.colors.surface)
      : theme.colors.primary

  return (
    <TabView
      navigationState={navigationState}
      renderScene={renderScene}
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
