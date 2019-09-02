import React, { Component } from 'react'
import { ScrollView, TextInput as RNTextInput } from 'react-native'
import { List, Divider, Button, Switch, TextInput } from 'react-native-paper'
import { logOut } from '../../lib/network'

import SettingsContext from '../../components/wrappers/SettingsContext'
import Theme from '../../components/wrappers/Theme'

export default class extends Component {
  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <SettingsContext.Consumer>
        {(context) => (
          <Theme>
            <ScrollView>
              <List.Section>
                <List.Subheader>General</List.Subheader>
                <List.Item
                  title='Dark theme'
                  right={() => (
                    <Switch
                      value={context.theme}
                      onValueChange={context.setTheme}
                    />
                  )}
                />
                <Button
                  mode='outlined'
                  style={{ margin: 16, marginTop: 8 }}
                  onPress={this.doLogOut}
                >
                  Log out
                </Button>
              </List.Section>
              <Divider />

              <List.Section>
                <List.Subheader>Editor</List.Subheader>
                <List.Item
                  title='Soft wrapping'
                  right={() => (
                    <Switch
                      value={context.softWrapping}
                      onValueChange={context.setSoftWrapping}
                    />
                  )}
                />
                <List.Item
                  title='Indent with spaces'
                  right={() => (
                    <Switch
                      value={context.softTabs}
                      onValueChange={context.setSoftTabs}
                    />
                  )}
                />
                <List.Item
                  title='Indent size'
                  right={() => (
                    <TextInput
                      value={context.indentSize}
                      onChangeText={context.setIndentSize}
                      render={(props) => (
                        <RNTextInput
                          {...props}
                          style={[ ...props.style, { textAlign: 'center' } ]}
                          keyboardType='number-pad'
                          maxLength={2}
                        />
                      )}
                    />
                  )}
                />
              </List.Section>
            </ScrollView>
          </Theme>
        )}
      </SettingsContext.Consumer>
    )
  }

  doLogOut = async () => {
    await logOut()
    this.props.navigation.navigate('Auth')
  }
}