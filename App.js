import React, { useState, useEffect, useRef } from 'react'
import { StatusBar } from 'react-native'
import { SplashScreen } from 'expo'
import * as Font from 'expo-font'
import { DarkTheme, DefaultTheme, Provider as PaperProvider } from 'react-native-paper'
import { createStackNavigator, createSwitchNavigator, createAppContainer } from 'react-navigation'

import { getUserInfo, updateEditorPreferences } from './lib/network'
import CustomHeader from './components/ui/CustomHeader'
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

const updateSettings = async (settings) => {
  const { user: editor_preferences } = await getUserInfo()
  await updateEditorPreferences({
    ...editor_preferences,
    theme: settings.theme,
    wrapping: settings.softWrapping,
    indentIsSpaces: settings.softTabs,
    indentSize: settings.indentSize
  })
}

export default () => {
  const [theme, setTheme] = useState('replitDark')
  const [softWrapping, setSoftWrapping] = useState(false)
  const [softTabs, setSoftTabs] = useState(true)
  const [indentSize, setIndentSize] = useState(2)
  const [redirectRoute, setRedirectRoute] = useState(null)

  const firstUpdate = useRef(true)
  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false
      return
    }

    try {
      updateSettings({
        theme,
        softWrapping,
        softTabs,
        indentSize
      })
    } catch (error) {
      // Unhandled on purpose
    }
  }, [theme, softWrapping, softTabs, indentSize])

  useEffect(() => {
    ;(async () => {
      SplashScreen.preventAutoHide()

      await Font.loadAsync({
        Inconsolata: require('./assets/fonts/Inconsolata-Regular.ttf'),
        Montserrat: require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat Medium': require('./assets/fonts/Montserrat-Medium.ttf'),
        'Montserrat Light': require('./assets/fonts/Montserrat-Light.ttf'),
        'Montserrat Thin': require('./assets/fonts/Montserrat-Thin.ttf')
      })

      const { success, user } = await getUserInfo()

      if (success) {
        const {
          editor_preferences: { theme, indentIsSpaces, indentSize, wrapping }
        } = user

        setTheme(theme)
        setSoftTabs(indentIsSpaces)
        setIndentSize(indentSize.toString())
        setSoftWrapping(wrapping)

        setRedirectRoute('App')
      } else setRedirectRoute('Auth')

      SplashScreen.hide()
    })()
  }, [])

  return (
    <PaperProvider theme={theme === 'replitDark' ? darkTheme : lightTheme}>
      <StatusBar barStyle="light-content" />
      <SettingsContext.Provider
        value={{
          theme,
          setTheme,
          softWrapping,
          setSoftWrapping,
          softTabs,
          setSoftTabs,
          indentSize,
          setIndentSize,
          redirectRoute,
          updateSettings
        }}
      >
        {console.log(
          `(${new Date().toLocaleTimeString()} rendering, redirectRoute=${redirectRoute}, theme=${theme})`
        )}
        {redirectRoute && <App />}
      </SettingsContext.Provider>
    </PaperProvider>
  )
}
