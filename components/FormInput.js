import React, { Component } from 'react'
import { TextInput as RNTextInput } from 'react-native'
import { TextInput } from 'react-native-paper'

export default class extends Component {
  render() {
    return (
      <TextInput
        label={this.props.label}
        style={{
          marginBottom: 20,
          backgroundColor: '#ffffff'
        }}
        mode='outlined'
        render={(props) => (
          <RNTextInput
            {...props}
            secureTextEntry={this.props.password}
            returnKeyType={this.props.returnKeyType || 'done'}
            blurOnSubmit={false}
            onSubmitEditing={this.props.onSubmit}
            autoCapitalize='none'
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
          />
        )}
        value={this.props.value}
        onChangeText={this.props.onChangeText}
        disabled={this.props.disabled}
        ref={(input) => this.input = input}
      />
    )
  }

  focus = () => this.input && this.input.focus()
  blur = () => this.input && this.input.blur()
}