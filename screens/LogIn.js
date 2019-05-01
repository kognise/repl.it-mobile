import React, { Component } from 'react'
import { View } from 'react-native'
import { Title, Button, Text } from 'react-native-paper'
import { logIn } from '../lib/network'
import { withTheme } from 'react-native-paper'
import FormInput from '../components/FormInput'

export default withTheme(class extends Component {
  static navigationOptions = {
    header: null
  }

  state = {
    username: '',
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
        <Title style={{
          fontSize: 36,
          padding: 16
        }}>Log in</Title>

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
          returnKeyType='next'
          disabled={this.state.loading}
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
          Log in
        </Button>
      </View>
    )
  }

  focusPassword = () => this.passwordInput && this.passwordInput.focus()
  submit = async () => {
    this.setState({ loading: true })
    try {
      const { username } = await logIn(this.state.username, this.state.password)
      if (!this.mounted) return
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