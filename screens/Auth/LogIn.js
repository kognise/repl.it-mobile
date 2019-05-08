import React, { Component } from 'react'
import { View } from 'react-native'
import { Button, Text, withTheme } from 'react-native-paper'
import { logIn } from '../../lib/network'
import SettingsContext from '../../components/SettingsContext'
import FormInput from '../../components/FormInput'
import Theme from '../../components/Theme'

export default withTheme(class extends Component {
  static navigationOptions = {
    title: 'Log In'
  }
  static contextType = SettingsContext

  state = {
    username: 'Xeborch',
    password: 'xeborch',
    error: null,
    loading: false
  }

  render() {
    return (
      <Theme>
        <View style={{ 
          flex: 1,
          justifyContent: 'center',
          padding: 20
        }}>
          {this.state.error && (
            <Text style={{ color: this.props.theme.colors.error }}>
              {this.state.error}
            </Text>
          )}

          <FormInput
            label='Email or username'
            value={this.state.username}
            onChangeText={this.updateUsername}
            onSubmit={this.focusPassword}
            disabled={this.state.loading}
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

          <SettingsContext.Consumer>
            {({ setTheme }) => (
              <Button
                mode='contained'
                onPress={() => this.submit(setTheme)}
                disabled={this.state.loading}
                loading={this.state.loading}
              >
                Log in
              </Button>
            )}
          </SettingsContext.Consumer>
        </View>
      </Theme>
    )
  }

  focusPassword = () => this.passwordInput && this.passwordInput.focus()
  submit = async (setTheme) => {
    this.setState({ loading: true })
    try {
      const { username, editor_preferences: { theme } } = await logIn(this.state.username, this.state.password)
      if (!this.mounted) return
      this.setState({
        username: '',
        password: '',
        error: null,
        loading: false
      })
      setTheme(theme === 'replitDark')
      this.props.navigation.navigate('Hello', { username })
    } catch(error) {
      if (!this.mounted) return
      this.setState({ loading: false, error: error.message })
    }
  }
  updateUsername = (username) => this.setState({ username })
  updatePassword = (password) => this.setState({ password })

  componentDidMount() {
    this.mounted = true
  }
  componentWillUnmount() {
    this.mounted = false
  }
})