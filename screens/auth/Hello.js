import React from 'react'
import { View } from 'react-native'
import { Title, Text, Button } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import Theme from '../../components/wrappers/Theme'

const Screen = () => {
  const { navigate, getParam } = useNavigation()

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
          Hello, {getParam('username', 'Repl.it user')}!
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

        <Button mode="contained" onPress={() => navigate('App')}>
          Go!
        </Button>
      </View>
    </Theme>
  )
}

Screen.navigationOptions = {
  title: 'Welcome'
}

export default Screen
