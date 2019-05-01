import React, { Component } from 'react'
import { Appbar } from 'react-native-paper'
import { goBack, resetAndNavigate } from '../lib/navigation'
import { logOut } from '../lib/network'

export default class extends Component {
  render() {
    const { state } = this.props.navigation
    const { options } = this.props.scene.descriptor
    return (
      <Appbar.Header>
        {state.routes.length > 1
          && <Appbar.BackAction onPress={this.goBack} />}
        <Appbar.Content title={options.title || 'Repl.it'} />
        <Appbar.Action
          icon='exit-to-app'
          onPress={async () => {
            await logOut()
            resetAndNavigate(this.props.navigation, 'Welcome')
          }}
        />
      </Appbar.Header>
    )
  }

  goBack = () => goBack(this.props.navigation)
}