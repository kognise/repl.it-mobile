import React, { Component } from 'react'
import Fuse from 'fuse.js'
import { View } from 'react-native'
import { Dialog, Portal, Button } from 'react-native-paper'

import { fetchLanguages, createRepl } from '../../../lib/network'
import FAB from '../../ui/FAB'
import FormInput from '../../ui/FormInput'
import ErrorMessage from '../../ui/ErrorMessage'

export default class extends Component {
  state = {
    dialogOpen: false,
    title: '',
    language: '',
    error: null,
    loading: false
  }

  render() {
    return (
      <View>
        <FAB icon="plus" onPress={this.open} />

        <Portal>
          <Dialog visible={this.state.dialogOpen} onDismiss={this.cancel}>
            <Dialog.Title>Create a Repl</Dialog.Title>

            <Dialog.Content>
              <ErrorMessage error={this.state.error} />

              <FormInput
                label="Name"
                value={this.state.title}
                onChangeText={this.updateTitle}
                disabled={this.state.loading}
                onSubmit={this.focusLanguage}
                hasNext
              />
              <FormInput
                label="Language"
                value={this.state.language}
                onChangeText={this.updateLanguage}
                ref={(input) => (this.languageInput = input)}
                onSubmit={this.create}
                disabled={this.state.loading}
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

  focusLanguage = () => this.languageInput && this.languageInput.focus()
  updateTitle = (title) => this.setState({ title })
  updateLanguage = (language) => this.setState({ language })

  open = () => this.setState({ dialogOpen: true })
  cancel = () =>
    this.setState({
      dialogOpen: false,
      title: '',
      language: '',
      error: null,
      loading: false
    })

  create = async () => {
    this.setState({ loading: true })
    try {
      if (!this.state.language) throw new Error('Please enter a language!')
      const languages = await fetchLanguages()
      const fuse = new Fuse(languages, {
        shouldSort: true,
        threshold: 0.6,
        location: 0,
        distance: 100,
        maxPatternLength: 16,
        minMatchCharLength: 1,
        keys: ['name', 'displayName'],
        id: 'name'
      })
      const result = fuse.search(this.state.language)[0]
      console.log(`got ${result} from ${this.state.language}`)
      if (!result) throw new Error("Sorry, we don't know what language that is!")

      const { id, title, url } = await createRepl(this.state.title, result, this.props.folderId)
      if (!this.state.dialogOpen) return
      this.cancel()
      this.props.reloadCurrent()
      this.props.navigate('Repl', { id, title, url, language: result, canWrite: true })
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
