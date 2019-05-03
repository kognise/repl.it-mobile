import React, { Component } from 'react'
import Fuse from 'fuse.js'
import { View } from 'react-native'
import { FAB, Dialog, Portal, Button, Text, withTheme } from 'react-native-paper'
import { fetchLanguages, createRepl } from '../lib/network'
import FormInput from './FormInput'

export default withTheme(class extends Component {
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
        <FAB
          style={{
            position: 'absolute',
            margin: 16,
            right: 0,
            bottom: 0
          }}
          icon='add'
          onPress={this.open}
        />

        <Portal>
          <Dialog visible={this.state.dialogOpen} onDismiss={this.cancel}>
            <Dialog.Title>Create a Repl</Dialog.Title>

            <Dialog.Content>
              {this.state.error && (
                <Text style={{ color: this.props.theme.colors.error }}>
                  {this.state.error}
                </Text>
              )}

              <FormInput
                label='Name'
                value={this.state.title}
                onChangeText={this.updateName}
                disabled={this.state.loading}
                onSubmit={this.focusLanguage}
                hasNext
              />
              <FormInput
                label='Language'
                value={this.state.language}
                onChangeText={this.updateLanguage}
                ref={(input) => this.languageInput = input}
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
  updateName = (title) => this.setState({ title })
  updateLanguage = (language) => this.setState({ language })

  open = () => this.setState({ dialogOpen: true })
  cancel = () => this.setState({
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
        keys: [ 'title', 'displayName' ],
        id: 'name'
      })
      const result = fuse.search(this.state.language)[0]
      if (!result) throw new Error('Sorry, we don\'t know what language that is!')

      const { id, title, url } = await createRepl(this.state.title, result, this.props.folderId)
      if (!this.state.dialogOpen) return
      this.cancel()
      this.props.navigation.navigate('Repl', { id, title, url })
    } catch(error) {
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
})