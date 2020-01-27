import React, { useContext, useState, useEffect, useRef } from 'react'
import { ScrollView, TextInput as RNTextInput } from 'react-native'
import { List, Divider, Button, Switch, TextInput } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import { logOut } from '../../lib/network'
import SettingsContext from '../../components/wrappers/SettingsContext'
import Theme from '../../components/wrappers/Theme'

const Screen = () => {
  const settings = useContext(SettingsContext)
  const [tempIndentSize, setTempIndentSize] = useState(settings.indentSize.toString())

  const firstUpdate = useRef(true)
  const settingsRef = useRef(settings)
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    const parsed = parseInt(tempIndentSize, 10)
    if (!isNaN(parsed)) settingsRef.current.setIndentSize(parsed)
  }, [tempIndentSize])

  const { navigate } = useNavigation()

  return (
    <Theme>
      <ScrollView>
        <List.Section>
          <List.Subheader>General</List.Subheader>
          <List.Item
            title="Use system theme"
            right={() => (
              <Switch
                value={settings.systemTheme}
                onValueChange={(systemTheme) => settings.setSystemTheme(systemTheme)}
              />
            )}
          />
          <List.Item
            title="Dark theme"
            right={() => (
              <Switch
                disabled={settings.systemTheme}
                value={settings.theme === 'replitDark'}
                onValueChange={(dark) => settings.setTheme(dark ? 'replitDark' : 'replitLight')}
              />
            )}
          />
          <Button
            mode="outlined"
            style={{ margin: 16, marginTop: 8 }}
            onPress={async () => {
              await logOut()
              navigate('Auth')
            }}
          >
            Log out
          </Button>
        </List.Section>
        <Divider />

        <List.Section>
          <List.Subheader>Editor</List.Subheader>
          <List.Item
            title="Soft wrapping"
            right={() => (
              <Switch value={settings.softWrapping} onValueChange={settings.setSoftWrapping} />
            )}
          />
          <List.Item
            title="Indent with spaces"
            right={() => <Switch value={settings.softTabs} onValueChange={settings.setSoftTabs} />}
          />
          <List.Item
            title="Indent size"
            right={() => (
              <TextInput
                value={tempIndentSize}
                onChangeText={setTempIndentSize}
                render={(props) => (
                  <RNTextInput
                    {...props}
                    style={[...props.style, { textAlign: 'center' }]}
                    keyboardType="number-pad"
                    maxLength={2}
                  />
                )}
              />
            )}
          />
        </List.Section>
      </ScrollView>
    </Theme>
  )
}

Screen.navigationOptions = {
  title: 'Settings'
}

export default Screen
