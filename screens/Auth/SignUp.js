import React, { Component } from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { Button, Text, withTheme } from 'react-native-paper'
import ReCaptcha from '../../components/ReCaptcha'
import FormInput from '../../components/FormInput'
import { signUp } from '../../lib/network'
import Theme from '../../components/Theme'

function waitForCaptcha(state) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      if (state.captcha) {
        clearInterval(interval)
        resolve()
      }
    }, 500)
  })
}

export default withTheme(class extends Component {
  static navigationOptions = {
    title: 'Sign Up'
  }

  state = {
    username: '',
    email: '',
    password: '',
    error: null,
    loading: false
  }

  render() {
    return (
      <Theme>
        <KeyboardAvoidingView style={{ 
          flex: 1,
          justifyContent: 'center',
          padding: 20
        }} behavior='padding'>
          {this.state.error && (
            <Text style={{ color: this.props.theme.colors.error }}>
              {this.state.error}
            </Text>
          )}

          <FormInput
            label='Username'
            value={this.state.username}
            onChangeText={this.updateUsername}
            onSubmit={this.focusEmail}
            disabled={this.state.loading}
            hasNext
          />
          <FormInput
            label='Email'
            value={this.state.email}
            onChangeText={this.updateEmail}
            ref={(input) => this.emailInput = input}
            disabled={this.state.loading}
            onSubmit={this.focusPassword}
            hasNext
          />
          <FormInput
            label='Password'
            value={this.state.password}
            onChangeText={this.updatePassword}
            ref={(input) => this.passwordInput = input}
            disabled={this.state.loading}
            onSubmit={this.submit}
            password
          />

          <Button
            mode='contained'
            onPress={this.submit}
            disabled={this.state.loading}
            loading={this.state.loading}
          >
            Sign up
          </Button>
          <ReCaptcha onExecute={this.updateCaptcha} />
        </KeyboardAvoidingView>
      </Theme>
    )
  }

  focusEmail = () => this.emailInput && this.emailInput.focus()
  focusPassword = () => this.passwordInput && this.passwordInput.focus()
  submit = async () => {
    this.setState({ loading: true })
    try {
      await waitForCaptcha(this)
      await signUp(this.state.username, this.state.email, this.state.password, this.captcha)
      if (!this.mounted) return

      const username = this.state.username
      this.setState({
        username: '',
        email: '',
        password: '',
        error: null,
        loading: false
      })
      this.props.navigation.navigate('Hello', { username })
    } catch(error) {
      if (!this.mounted) return
      this.setState({ loading: false, error: error.message })
    }
  }
  updateCaptcha = (captcha) => this.captcha = captcha
  updateUsername = (username) => this.setState({ username })
  updateEmail = (email) => this.setState({ email })
  updatePassword = (password) => this.setState({ password })

  componentDidMount() {
    this.mounted = true
  }
  componentWillUnmount() {
    this.mounted = false
  }
})