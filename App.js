import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createAppContainer } from 'react-navigation'
import InitialScreen from './screens/Initial'
import WelcomeScreen from './screens/Welcome'
import LogInScreen from './screens/LogIn'
import HelloScreen from './screens/Hello'
import HomeScreen from './screens/Home'
import ReplScreen from './screens/Repl'

const Navigator = createStackNavigator({
  Initial: { screen: InitialScreen },
  Welcome: { screen: WelcomeScreen },
  LogIn: { screen: LogInScreen },
  Hello: { screen: HelloScreen },
  Home: { screen: HomeScreen },
  Repl: { screen: ReplScreen }
}, {
  initialRouteName: 'Initial'
})
const App = createAppContainer(Navigator)

export default () => (
  <PaperProvider>
    <App />
  </PaperProvider>
)