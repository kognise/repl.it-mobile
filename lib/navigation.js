import { StackActions, NavigationActions } from 'react-navigation'

function resetAndNavigate(navigation, routeName, params) {
  const resetAction = StackActions.reset({
    index: 0,
    actions: [
      NavigationActions.navigate({ routeName, params })
    ]
  })
  navigation.dispatch(resetAction)
}

export { resetAndNavigate }