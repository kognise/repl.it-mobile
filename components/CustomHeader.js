import React, { Component } from 'react'
import { Appbar } from 'react-native-paper'
import { goBack, resetAndNavigate } from '../lib/navigation'
import { logOut } from '../lib/network'

export default class extends Component {
  render() {
    const { state } = this.props.navigation
    const title = state.routes[state.index].routeName
    return (
      <Appbar.Header>
        {state.routes.length > 1
          && <Appbar.BackAction onPress={this.goBack} />}
        <Appbar.Content title={title} />
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