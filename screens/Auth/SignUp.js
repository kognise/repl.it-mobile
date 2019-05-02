import React, { Component } from 'react'
import { View } from 'react-native'
import { Button, Text, withTheme } from 'react-native-paper'
import ReCaptcha from 'react-native-recaptcha-v3'
import { signUp } from '../../lib/network'
import FormInput from '../../components/FormInput'

export default withTheme(class extends Component {
  static navigationOptions = {
    title: 'Sign up'
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
      <View style={{ 
        flex: 1,
        justifyContent: 'center',
        padding: 20
      }}>
        <ReCaptcha
          siteKey='6Lc7fZQUAAAAAIXMD8AonuuleBX0P3hS2XW364Ms'
          url='https://repl.it'
          containerStyle={{
            display: 'none'
          }}
          reCaptchaType={1}
          onExecute={this.updateCaptcha}
        />

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
      </View>
    )
  }

  focusEmail = () => this.emailInput && this.emailInput.focus()
  focusPassword = () => this.passwordInput && this.passwordInput.focus()
  submit = async () => {
    this.setState({ loading: true })
    try {
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