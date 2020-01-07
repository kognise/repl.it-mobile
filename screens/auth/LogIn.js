import React, { useState, useRef, useContext } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { Button } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import { logIn } from '../../lib/network'
import useMounted from '../../lib/useMounted'
import FormInput from '../../components/ui/FormInput'
import ErrorMessage from '../../components/ui/ErrorMessage'
import Theme from '../../components/wrappers/Theme'
import SettingsContext from '../../components/wrappers/SettingsContext'

const Screen = () => {
  const mounted = useMounted()
  const settings = useContext(SettingsContext)
  const { navigate } = useNavigation()

  const [username, setUsername] = useState('Xeborch')
  const [password, setPassword] = useState('xeborch')
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const passwordRef = useRef()

  const submit = async () => {
    setLoading(true)
    try {
      const {
        editor_preferences: { theme, indentIsSpaces, indentSize, wrapping }
      } = await logIn(username, password)
      if (!mounted.current) return

      settings.setTheme(theme)
      settings.setSoftTabs(indentIsSpaces)
      settings.setIndentSize(indentSize.toString())
      settings.setSoftWrapping(wrapping)

      setUsername('')
      setPassword('')
      setError(undefined)
      setLoading(false)
      navigate('Hello', { username })
    } catch (error) {
      if (!mounted.current) return
      setLoading(false)
      setError(error.message)
    }
  }

  return (
    <Theme>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 20
        }}
        behavior="padding"
      >
        <ErrorMessage error={error} />

        <FormInput
          label="Email or username"
          value={username}
          onChangeText={setUsername}
          onSubmit={() => passwordRef.current.focus()}
          disabled={loading}
          hasNext
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          ref={passwordRef}
          disabled={loading}
          onSubmit={submit}
          password
        />

        <Button mode="contained" onPress={submit} disabled={loading} loading={loading}>
          Log in
        </Button>
      </KeyboardAvoidingView>
    </Theme>
  )
}

Screen.navigationOptions = {
  title: 'Log In'
}

export default Screen
