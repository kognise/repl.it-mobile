import React, { useEffect, useContext } from 'react'
import { View } from 'react-native'
import { useNavigation } from 'react-navigation-hooks'

import { isLoggedIn } from '../lib/network'
import ActivityIndicator from '../components/customized/ActivityIndicator'
import SettingsContext from '../components/wrappers/SettingsContext'
import Theme from '../components/wrappers/Theme'

export default () => {
  const settings = useContext(SettingsContext)
  const { navigate } = useNavigation()

  useEffect(() => {
    ;(async () => {
      const { success, editor_preferences } = await isLoggedIn()

      if (success) {
        const { theme, indentIsSpaces, indentSize, wrapping } = editor_preferences

        settings.setTheme(theme)
        settings.setSoftTabs(indentIsSpaces)
        settings.setIndentSize(indentSize.toString())
        settings.setSoftWrapping(wrapping)

        navigate('App')
      } else navigate('Auth')
    })()
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
