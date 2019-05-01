import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'
import { useScreens } from 'react-native-screens'
import { transitionConfig } from './lib/navigation'
import CustomHeader from './components/CustomHeader'
import InitialScreen from './screens/Initial'
import WelcomeScreen from './screens/Welcome'
import LogInScreen from './screens/LogIn'
import HelloScreen from './screens/Hello'
import HomeScreen from './screens/Home'
import ReplScreen from './screens/Repl'
import FileScreen from './screens/File'

const AuthNavigator = createStackNavigator({
  Welcome: { screen: WelcomeScreen },
  LogIn: { screen: LogInScreen },
  Hello: { screen: HelloScreen }
}, {
  initialRouteName: 'Welcome',
  transitionConfig
})

const AppNavigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Repl: { screen: ReplScreen },
  File: { screen: FileScreen }
}, {
  initialRouteName: 'Home',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
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