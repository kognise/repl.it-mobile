import React, { Component } from 'react'
import { Appbar } from 'react-native-paper'
import { goBack } from '../lib/navigation'

export default class extends Component {
  render() {
    const { state } = this.props.navigation
    const { options } = this.props.scene.descriptor
    return (
      <Appbar.Header>
        {state.routes.length > 1
          && <Appbar.BackAction onPress={this.goBack} />}
        <Appbar.Content title={options.title || 'Repl.it'} />
        {this.props.right}
      </Appbar.Header>
    )
  }

  goBack = () => goBack(this.props.navigation)
}