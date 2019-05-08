import React, { Component } from 'react'
import { ScrollView, TextInput as RNTextInput } from 'react-native'
import { List, Divider, Button, Switch, TextInput } from 'react-native-paper'
import { logOut } from '../../lib/network'
import SettingsContext from '../../components/SettingsContext'
import Theme from '../../components/Theme'

export default class extends Component {
  static navigationOptions = {
    title: 'Settings'
  }

  render() {
    return (
      <SettingsContext.Consumer>
        {({ theme, setTheme }) => (
          <Theme>
            <ScrollView>
              <List.Section>
                <List.Subheader>General</List.Subheader>
                <List.Item
                  title='Dark theme'
                  right={() => (
                    <Switch
                      value={theme}
                      onValueChange={setTheme}
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
                      value={false}
                      disabled
                    />
                  )}
                />
                <List.Item
                  title='Indent with spaces'
                  right={() => (
                    <Switch
                      value={true}
                      disabled
                    />
                  )}
                />
                <List.Item
                  title='Indent size'
                  right={() => (
                    <TextInput
                      value={'4'}
                      render={(props) => (
                        <RNTextInput
                          {...props}
                          style={[ ...props.style, { textAlign: 'center' } ]}
                          keyboardType='number-pad'
                        />
                      )}
                      disabled
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