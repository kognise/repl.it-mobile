import React from 'react'
import { View } from 'react-native'
import { Title, Text, Button } from 'react-native-paper'
import { useNavigation } from 'react-navigation-hooks'

import ImageButton from '../../components/ui/ImageButton'
import HorizontalList from '../../components/ui/HorizontalList'
import Theme from '../../components/wrappers/Theme'

export default () => {
  const { navigate } = useNavigation()

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
          Welcome!
        </Title>
        <Text
          style={{
            fontSize: 18,
            textAlign: 'center',
            maxWidth: '84%',
            marginBottom: 20
          }}
        >
          Just sign in or sign up and you'll be ready to start coding with Repl.it
        </Text>

        <HorizontalList style={{ marginBottom: 20 }}>
          <ImageButton image="google" onPress={() => navigate('GoogleProvider')} />
          <ImageButton image="github" onPress={() => navigate('GitHubProvider')} />
          <ImageButton image="facebook" onPress={() => navigate('FacebookProvider')} />
        </HorizontalList>

        <Button
          mode="contained"
          style={{ marginBottom: 10, minWidth: 200 }}
          onPress={() => navigate('LogIn')}
        >
          Log in
        </Button>
        <Button mode="outlined" style={{ minWidth: 200 }} onPress={() => navigate('SignUp')}>
          Sign up
        </Button>
      </View>
    </Theme>
  )
}
