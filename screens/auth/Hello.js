import React, { Component } from 'react'
import { View } from 'react-native'
import { Title, Text, Button } from 'react-native-paper'

import Theme from '../../components/wrappers/Theme'

export default class extends Component {
  static navigationOptions = {
    title: 'Welcome'
  }

  render() {
    return (
      <Theme>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Title
            style={{
              fontSize: 36,
              padding: 16,
              textAlign: 'center'
            }}
          >
            Hello, {this.props.navigation.getParam('username', 'Repl.it user')}!
          </Title>
          <Text
            style={{
              fontSize: 18,
              textAlign: 'center',
              maxWidth: '84%',
              marginBottom: 20
            }}
          >
            You're all set to get started
          </Text>

          <Button mode="contained" onPress={() => this.props.navigation.navigate('App')}>
            Go!
          </Button>
        </View>
      </Theme>
    )
  }
}
