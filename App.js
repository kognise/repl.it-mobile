import React from 'react'
import { Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createAppContainer } from 'react-navigation'
import HomeScreen from './screens/Home'
import ReplScreen from './screens/Repl'

const Navigator = createStackNavigator({
  Home: { screen: HomeScreen },
  Repl: { screen: ReplScreen }
})
const App = createAppContainer(Navigator)

export default () => (
  <PaperProvider>
    <App />
  </PaperProvider>
)