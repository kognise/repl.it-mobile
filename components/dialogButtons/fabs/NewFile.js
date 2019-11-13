import React, { Component } from 'react'
import { View } from 'react-native'
import { FAB, Dialog, Portal, Button, withTheme } from 'react-native-paper'

import { getUrls, writeFile } from '../../../lib/network'
import FormInput from '../../ui/FormInput'
import ErrorMessage from '../../ui/ErrorMessage'

export default withTheme(
  class extends Component {
    state = {
      dialogOpen: false,
      name: '',
      error: null,
      loading: false
    }

    render() {
      return (
        <View>
          <FAB
            style={{
              position: 'absolute',
              margin: 16,
              right: 0,
              bottom: 0
            }}
            icon="create"
            onPress={this.open}
          />

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
                  background={this.props.theme.colors.surface}
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
        const { id } = this.props
        const { name } = this.state

        const urls = await getUrls(id, name)
        await writeFile(urls, '')
        if (!this.state.dialogOpen) return

        this.cancel()
        this.props.reload()
        this.props.navigate('File', { id, path: name })
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
)
