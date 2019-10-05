import React, { useState, useRef } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { Button, Text, withTheme } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import { signUp } from '../../lib/network'
import useMounted from '../../lib/useMounted'

import ReCaptcha from '../../components/webViews/ReCaptcha'
import FormInput from '../../components/customized/FormInput'
import Theme from '../../components/wrappers/Theme'

const waitFor = (thing) => {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (thing) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })
}

const Screen = (props) => {
  const mounted = useMounted()
  const { navigate } = useNavigation()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState()
  const [loading, setLoading] = useState(false)

  const captchaRef = useRef()
  const emailRef = useRef()
  const passwordRef = useRef()

  const submit = async () => {
    setLoading(true)
    try {
      await waitFor(captchaRef.current)
      await signUp(username, email, password, captchaRef.current)
      if (!mounted) return

      setUsername('')
      setEmail('')
      setPassword('')
      setError(undefined)
      setLoading(false)
      navigate('Hello', { username })
    } catch (error) {
      if (!mounted) return
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
        {error && <Text style={{ color: props.theme.colors.error }}>{error}</Text>}

        <FormInput
          label="Username"
          value={username}
          onChangeText={setUsername}
          onSubmit={() => emailRef.current.focus()}
          disabled={loading}
          hasNext
        />
        <FormInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          ref={emailRef}
          disabled={loading}
          onSubmit={() => passwordRef.current.focus()}
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
          Sign up
        </Button>
        <ReCaptcha onExecute={(captcha) => (captchaRef.current = captcha)} />
      </KeyboardAvoidingView>
    </Theme>
  )
}

Screen.navigationOptions = {
  title: 'Sign Up'
}

export default withTheme(Screen)
