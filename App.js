import React, { Component } from 'react'
import { StatusBar, AsyncStorage } from 'react-native'
import { SplashScreen } from 'expo'
import * as Font from 'expo-font'
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
import LoadReplScreen from './screens/App/LoadRepl'
import ReplScreen from './screens/App/Repl'
import FileScreen from './screens/App/File'

const AuthNavigator = createStackNavigator({
  Welcome: WelcomeScreen,
  LogIn: LogInScreen,
  SignUp: SignUpScreen,
  Hello: HelloScreen,

  GoogleProvider: GoogleProviderScreen,
  GitHubProvider: GitHubProviderScreen,
  FacebookProvider: FacebookProviderScreen
}, {
  initialRouteName: 'Welcome',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const AppNavigator = createStackNavigator({
  Dashboard: DashboardScreen,
  Settings: SettingsScreen,
  LoadRepl: LoadReplScreen,
  Repl: ReplScreen,
  File: FileScreen
}, {
  initialRouteName: 'Dashboard',
  defaultNavigationOptions: {
    header: (props) => <CustomHeader {...props} />
  }
})

const Navigator = createSwitchNavigator({
  Initial: createStackNavigator({
    Initial: InitialScreen
  }, {
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }),
  Auth: AuthNavigator,
  App: AppNavigator
}, { initialRouteName: 'Initial' })
const App = createAppContainer(Navigator)

const primary = '#e83d39'
const accent = '#687d85'
const roundness = 0

const fonts = {
  regular: 'Montserrat',
  medium: 'Montserrat Medium',
  light: 'Montserrat Light',
  thin: 'Montserrat Thin'
}

const darkTheme = {
  ...DarkTheme,
  roundness, fonts,
  colors: {
    ...DarkTheme.colors,
    primary, accent,
    background: '#121212',
    surface: '#373737',
    appBar: '#1f1f1f'
  }
}
const lightTheme = {
  ...DefaultTheme,
  roundness, fonts,
  colors: {
    ...DefaultTheme.colors,
    primary, accent,
    appBar: primary
  }
}

export default class extends Component {
  state = {
    theme: lightTheme,
    softWrapping: false,
    softTabs: true,
    indentSize: '2',
    ready: false
  }

  constructor(props) {
    super(props)
    SplashScreen.preventAutoHide()
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
          {this.state.ready && <App />}
        </SettingsContext.Provider>
      </PaperProvider>
    )
  }

  asyncSetState = (newState) => new Promise((resolve) => {
    this.setState(newState, resolve)
  })

  setTheme = async (dark) => {
    await this.asyncSetState({
      theme: dark ? darkTheme : lightTheme
    })
    await AsyncStorage.setItem('@dark', dark ? 'glory' : '')
  }

  setSoftWrapping = async (softWrapping) => {
    await this.asyncSetState({ softWrapping })
    await AsyncStorage.setItem('@wrapping', softWrapping ? 'soft' : 'hard')
  }

  setSoftTabs = async (softTabs) => {
    await this.asyncSetState({ softTabs })
    await AsyncStorage.setItem('@tabs', softTabs ? 'soft' : 'hard')
  }

  setIndentSize = async (indentSize) => {
    if (!/^[0-9]+$/.test(indentSize)) return
    await this.asyncSetState({ indentSize })
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

    await Font.loadAsync({
      'Inconsolata': require('./assets/fonts/Inconsolata-Regular.ttf'),
      'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
      'Montserrat Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
      'Montserrat Light': require('./assets/fonts/Montserrat-Light.ttf'),
      'Montserrat Thin': require('./assets/fonts/Montserrat-Thin.ttf')
    })
    await this.asyncSetState({ ready: true })
    SplashScreen.hide()
  }
}