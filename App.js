import React, { useState, useEffect, useMemo } from 'react'
import { StatusBar, AsyncStorage } from 'react-native'
import { SplashScreen } from 'expo'
import * as Font from 'expo-font'
import { DarkTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'

import CustomHeader from './components/customized/CustomHeader'
import SettingsContext from './components/wrappers/SettingsContext'

import InitialScreen from './screens/Initial'

import WelcomeScreen from './screens/auth/Welcome'
import LogInScreen from './screens/auth/LogIn'
import SignUpScreen from './screens/auth/SignUp'
import HelloScreen from './screens/auth/Hello'

import GoogleProviderScreen from './screens/auth/providers/Google'
import GitHubProviderScreen from './screens/auth/providers/GitHub'
import FacebookProviderScreen from './screens/auth/providers/Facebook'

import DashboardScreen from './screens/app/Dashboard'
import SettingsScreen from './screens/app/Settings'
import LoadReplScreen from './screens/app/LoadRepl'
import ReplScreen from './screens/app/Repl'
import FileScreen from './screens/app/File'

const AuthNavigator = createStackNavigator(
  {
    Welcome: WelcomeScreen,
    LogIn: LogInScreen,
    SignUp: SignUpScreen,
    Hello: HelloScreen,

    GoogleProvider: GoogleProviderScreen,
    GitHubProvider: GitHubProviderScreen,
    FacebookProvider: FacebookProviderScreen
  },
  {
    initialRouteName: 'Welcome',
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }
)

const AppNavigator = createStackNavigator(
  {
    Dashboard: DashboardScreen,
    Settings: SettingsScreen,
    LoadRepl: LoadReplScreen,
    Repl: ReplScreen,
    File: FileScreen
  },
  {
    initialRouteName: 'Dashboard',
    defaultNavigationOptions: {
      header: (props) => <CustomHeader {...props} />
    }
  }
)

const Navigator = createSwitchNavigator(
  {
    Initial: createStackNavigator(
      {
        Initial: InitialScreen
      },
      {
        defaultNavigationOptions: {
          header: (props) => <CustomHeader {...props} />
        }
      }
    ),
    Auth: AuthNavigator,
    App: AppNavigator
  },
  { initialRouteName: 'Initial' }
)
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
  roundness,
  fonts,
  colors: {
    ...DarkTheme.colors,
    primary,
    accent,
    background: '#121212',
    surface: '#373737',
    appBar: '#1f1f1f'
  }
}
const lightTheme = {
  ...DefaultTheme,
  roundness,
  fonts,
  colors: {
    ...DefaultTheme.colors,
    primary,
    accent,
    appBar: primary
  }
}

export default () => {
  const [dark, setDark] = useState(false)
  const theme = useMemo(() => (dark ? darkTheme : lightTheme), [dark])
  const [softWrapping, setSoftWrapping] = useState(false)
  const [softTabs, setSoftTabs] = useState(true)
  const [indentSize, setIndentSize] = useState(2)
  const [ready, setReady] = useState(false)

  useEffect(() => AsyncStorage.setItem('@dark', dark ? 'glory' : '') && undefined, [dark])
  useEffect(() => AsyncStorage.setItem('@wrapping', softWrapping ? 'soft' : 'hard') && undefined, [
    softWrapping
  ])
  useEffect(() => AsyncStorage.setItem('@tabs', softTabs ? 'soft' : 'hard') && undefined, [
    softTabs
  ])
  useEffect(() => AsyncStorage.setItem('@indent', (indentSize || 2).toString()) && undefined, [
    indentSize
  ])

  useEffect(() => {
    ;(async () => {
      SplashScreen.preventAutoHide()

      const loadedDark = await AsyncStorage.getItem('@dark')
      setDark(loadedDark === 'glory')

      const loadedSoftWrapping = await AsyncStorage.getItem('@wrapping')
      setSoftWrapping(loadedSoftWrapping === 'soft')

      const loadedSoftTabs = await AsyncStorage.getItem('@tabs')
      setSoftTabs(loadedSoftTabs !== 'hard')

      const loadedIndentSize = await AsyncStorage.getItem('@indent')
      setIndentSize(parseInt(loadedIndentSize, 10) || 2)

      await Font.loadAsync({
        Inconsolata: require('./assets/fonts/Inconsolata-Regular.ttf'),
        Montserrat: require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat Light': require('./assets/fonts/Montserrat-Light.ttf'),
        'Montserrat Thin': require('./assets/fonts/Montserrat-Thin.ttf')
      })

      setReady(true)
      SplashScreen.hide()
    })()
  }, [])

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" />
      <SettingsContext.Provider
        value={{
          dark,
          setDark,
          softWrapping,
          setSoftWrapping,
          softTabs,
          setSoftTabs,
          indentSize,
          setIndentSize
        }}
      >
        {ready && <App />}
      </SettingsContext.Provider>
    </PaperProvider>
  )
}
