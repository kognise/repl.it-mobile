import React, { useState, useRef, useContext } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { Button } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import { logIn } from '../../lib/network'
import useMounted from '../../lib/useMounted'
import FormInput from '../../components/ui/FormInput'
import ErrorMessage from '../../components/ui/ErrorMessage'
import CheckboxWithLabel from '../../components/ui/CheckboxWithLabel'
import Theme from '../../components/wrappers/Theme'
import SettingsContext from '../../components/wrappers/SettingsContext'

const testAccount = {
  username: 'Xeborch',
  password: 'xeborch'
}

const Screen = () => {
  const mounted = useMounted()
  const settings = useContext(SettingsContext)
  const { navigate } = useNavigation()

  const [testAccountEnabled, setTestAccountEnabled] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const passwordRef = useRef()

  const submit = async () => {
    setLoading(true)
    try {
      const {
        username: actualUsername,
        editor_preferences: { theme, indentIsSpaces, indentSize, wrapping }
      } = await logIn(
        testAccountEnabled ? testAccount.username : username,
        testAccountEnabled ? testAccount.password : password
      )
      if (!mounted.current) return

      settings.setTheme(theme)
      settings.setSoftTabs(indentIsSpaces)
      settings.setIndentSize(indentSize.toString())
      settings.setSoftWrapping(wrapping)

      setUsername('')
      setPassword('')
      setError(undefined)
      setLoading(false)
      navigate('Hello', { username: actualUsername })
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

        <CheckboxWithLabel
          label="Use test account"
          checked={testAccountEnabled}
          setChecked={setTestAccountEnabled}
          style={{ marginBottom: 10 }}
        />

        <FormInput
          label="Email or username"
          value={username}
          onChangeText={setUsername}
          onSubmit={() => passwordRef.current.focus()}
          disabled={loading || testAccountEnabled}
          hasNext
        />
        <FormInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          ref={passwordRef}
          disabled={loading || testAccountEnabled}
          onSubmit={submit}
          password
        />

        <Button
          mode="contained"
          onPress={submit}
          disabled={loading || (!testAccountEnabled && (!username || !password))}
          loading={loading}
        >
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
