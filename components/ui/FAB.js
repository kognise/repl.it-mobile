import React from 'react'
import { FAB } from 'react-native-paper'

export default ({ style, icon, onPress }) => (
  <FAB
    style={{
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      ...style
    }}
    icon={icon}
    onPress={onPress}
  />
)
