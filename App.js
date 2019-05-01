import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'
// import { useScreens } from 'react-native-screens'
import { Appbar } from 'react-native-paper'
import { logOut } from './lib/network'
import { transitionConfig } from './lib/navigation'
import CustomHeader from './components/CustomHeader'
import InitialScreen from './screens/Initial'
import WelcomeScreen from './screens/Auth/Welcome'
import LogInScreen from './screens/Auth/LogIn'
import HelloScreen from './screens/Auth/Hello'
import HomeScreen from './screens/App/Home'
import ReplScreen from './screens/App/Repl'
import FileScreen from './screens/App/File'

const AuthNavigator = createStackNavigator({
  Welcome: { screen: WelcomeScreen },
  LogIn: { screen: LogInScreen },
  Hello: { screen: HelloScreen }
}, {
  initialRouteName: 'Welcome',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  },
  transitionConfig
})

const AppNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Repl: { screen: ReplScreen },
  File: { screen: FileScreen }
}, {
  initialRouteName: 'Home',
  defaultNavigationOptions: {
    header: (props) => (
      <CustomHeader {...props}
        right={(
          <Appbar.Action
            icon='exit-to-app'
            onPress={async () => {
              await logOut()
              props.navigation.navigate('Auth')
            }}
          />
        )}
      />
    )
  },
  transitionConfig
})

// useScreens() // TODO: Look into broken autofill
const Navigator = createSwitchNavigator({
  Initial: InitialScreen,
  Auth: AuthNavigator,
  App: AppNavigator
}, { initialRouteName: 'Initial' })
const App = createAppContainer(Navigator)

export default () => (
  <PaperProvider>
    <App />
  </PaperProvider>
)