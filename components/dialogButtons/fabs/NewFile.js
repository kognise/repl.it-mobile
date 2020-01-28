import React, { Component } from 'react'
import { View } from 'react-native'
import { Dialog, Portal, Button } from 'react-native-paper'

import FAB from '../../ui/FAB'
import FormInput from '../../ui/FormInput'
import ErrorMessage from '../../ui/ErrorMessage'

export default class extends Component {
  state = {
    dialogOpen: false,
    name: '',
    error: null,
    loading: false
  }

  render() {
    return (
      <View>
        <FAB icon="pencil" onPress={this.open} />

        <Portal>
          <Dialog visible={this.state.dialogOpen} onDismiss={this.cancel}>
            <Dialog.Title>New File</Dialog.Title>

            <Dialog.Content>
              <ErrorMessage error={this.state.error} />

              <FormInput
                label="Name"
                value={this.state.name}
                onChangeText={this.updateName}
                disabled={this.state.loading}
                onSubmit={this.create}
              />
            </Dialog.Content>

            <Dialog.Actions>
              <Button onPress={this.cancel}>Cancel</Button>
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
      </View>
    )
  }

  updateName = (name) => this.setState({ name })
  open = () => this.setState({ dialogOpen: true })
  cancel = () =>
    this.setState({
      dialogOpen: false,
      name: '',
      error: null,
      loading: false
    })

  create = async () => {
    this.setState({ loading: true })
    try {
      if (!this.state.name) throw new Error('Please enter a filename!')
      const { id, crosis } = this.props
      const { name } = this.state

      const files = crosis.getChannel('gcsfiles')
      await files.request({ write: { path: name, content: '' } })
      if (!this.state.dialogOpen) return

      this.cancel()
      this.props.reloadCurrent()
      this.props.navigate('File', { id, crosis, path: name, canWrite: true })
    } catch (error) {
      if (!this.state.dialogOpen) return
      this.setState({
        error: error.message,
        loading: false
      })
    }
  }

  componentWillUnmount() {
    this.cancel()
  }
}
