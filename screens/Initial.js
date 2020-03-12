import React, { useEffect, useContext } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'react-navigation-hooks'

import ActivityIndicator from '../components/ui/ActivityIndicator'
import SettingsContext from '../components/wrappers/SettingsContext'
import Theme from '../components/wrappers/Theme'

export default () => {
  const settings = useContext(SettingsContext)
  const { navigate } = useNavigation()

  useEffect(() => {
    navigate(settings.redirectRoute)
  })

  return (
    <Theme>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <ActivityIndicator />
      </View>
    </Theme>
  )
}
