import React, { Component } from 'react'
import { Menu, Dialog, Portal, Button } from 'react-native-paper'

import { createFolder } from '../../../lib/network'
import FormInput from '../../ui/FormInput'
import ErrorMessage from '../../ui/ErrorMessage'

export default class extends Component {
  state = {
    dialogOpen: false,
    name: '',
    loading: false,
    error: null
  }

  render() {
    return (
      <>
        <Menu.Item title="New folder" onPress={this.open} />

        <Portal>
          <Dialog visible={this.state.dialogOpen} onDismiss={this.cancel}>
            <Dialog.Title>New Folder</Dialog.Title>

            <Dialog.Content>
              <ErrorMessage error={this.state.error} marginBottom={10} />

              <FormInput
                label="Name"
                value={this.state.name}
                onChangeText={this.updateName}
                disabled={this.state.loading}
                onSubmit={this.create}
              />
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={this.cancel} disabled={this.state.loading}>
                Cancel
              </Button>
              <Button
                onPress={this.create}
                loading={this.state.loading}
                disabled={this.state.loading}
              >
                Create
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </>
    )
  }

  updateName = (name) => this.setState({ name })
  open = () => this.setState({ dialogOpen: true })
  cancel = () => {
    this.setState({
      dialogOpen: false,
      loading: false,
      error: null
    })
    this.props.closeMenu()
  }

  create = async () => {
    this.setState({ loading: true })
    try {
      await createFolder(this.state.name, this.props.id)
      if (!this.state.dialogOpen) return
      this.props.reloadCurrent()
      this.cancel()
    } catch (error) {
      if (!this.state.dialogOpen) return
      this.setState({
        error: error.message,
        loading: false
      })
    }
  }
}
