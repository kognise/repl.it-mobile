import React, { Component } from 'react'
import { StatusBar, AsyncStorage } from 'react-native'
import { DarkTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'
import CustomHeader from './components/CustomHeader'
import SettingsContext from './components/SettingsContext'

import InitialScreen from './screens/Initial'

import WelcomeScreen from './screens/Auth/Welcome'
import LogInScreen from './screens/Auth/LogIn'
import SignUpScreen from './screens/Auth/SignUp'
import HelloScreen from './screens/Auth/Hello'

import GoogleProviderScreen from './screens/Auth/Providers/Google'
import GitHubProviderScreen from './screens/Auth/Providers/GitHub'
import FacebookProviderScreen from './screens/Auth/Providers/Facebook'

import DashboardScreen from './screens/App/Dashboard'
import SettingsScreen from './screens/App/Settings'
import ReplScreen from './screens/App/Repl'
import FileScreen from './screens/App/File'

const AuthNavigator = createStackNavigator({
  Welcome: { screen: WelcomeScreen },
  LogIn: { screen: LogInScreen },
  SignUp: { screen: SignUpScreen },
  Hello: { screen: HelloScreen },

  GoogleProvider: { screen: GoogleProviderScreen },
  GitHubProvider: { screen: GitHubProviderScreen },
  FacebookProvider: { screen: FacebookProviderScreen }
}, {
  initialRouteName: 'Welcome',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const AppNavigator = createStackNavigator({
  Dashboard: { screen: DashboardScreen },
  Settings: { screen: SettingsScreen },
  Repl: { screen: ReplScreen },
  File: { screen: FileScreen }
}, {
  initialRouteName: 'Dashboard',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const Navigator = createSwitchNavigator({
  Initial: InitialScreen,
  Auth: AuthNavigator,
  App: AppNavigator
}, { initialRouteName: 'Initial' })
const App = createAppContainer(Navigator)

export default class extends Component {
  state = {
    theme: {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        primary: '#ff1255',
        accent: '#008cff'
      }
    },
    softWrapping: false,
    softTabs: true,
    indentSize: '2'
  }

  render() {
    return (
      <PaperProvider theme={this.state.theme}>
        <StatusBar barStyle='light-content' />
        <SettingsContext.Provider value={{
          theme: this.state.theme.dark,
          setTheme: this.setTheme,
          softWrapping: this.state.softWrapping,
          setSoftWrapping: this.setSoftWrapping,
          softTabs: this.state.softTabs,
          setSoftTabs: this.setSoftTabs,
          indentSize: this.state.indentSize,
          setIndentSize: this.setIndentSize
        }}>
          <App />
        </SettingsContext.Provider>
      </PaperProvider>
    )
  }

  setTheme = async (dark) => {
    this.setState({
      theme: {
        ...(dark ? DarkTheme : DefaultTheme),
        colors: {
          ...(dark ? DarkTheme.colors : DefaultTheme.colors),
          primary: '#ff1255',
          accent: '#008cff'
        }
      }
    })
    await AsyncStorage.setItem('@dark', dark ? 'glory' : '')
  }

  setSoftWrapping = async (softWrapping) => {
    this.setState({ softWrapping })
    await AsyncStorage.setItem('@wrapping', softWrapping ? 'soft' : 'hard')
  }

  setSoftTabs = async (softTabs) => {
    this.setState({ softTabs })
    await AsyncStorage.setItem('@tabs', softTabs ? 'soft' : 'hard')
  }

  setIndentSize = async (indentSize) => {
    if (!/^[0-9]+$/.test(indentSize)) return
    this.setState({ indentSize })
    await AsyncStorage.setItem('@indent', indentSize)
  }

  async componentDidMount() {
    const theme = await AsyncStorage.getItem('@dark')
    this.setTheme(theme === 'glory')

    const wrapping = await AsyncStorage.getItem('@wrapping')
    this.setSoftWrapping(wrapping === 'soft')

    const tabs = await AsyncStorage.getItem('@tabs')
    this.setSoftTabs(tabs !== 'hard')

    const indentSize = await AsyncStorage.getItem('@indent')
    this.setIndentSize(indentSize || '2')
  }
}