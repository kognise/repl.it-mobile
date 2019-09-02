import { StackActions } from 'react-navigation'

function goBack(navigation) {
  const backAction = StackActions.pop({ n: 1 })
  navigation.dispatch(backAction)
}

function navigateSame(navigation, params = {}) {
  const pushAction = StackActions.push({
    routeName: navigation.state.routeName,
    params
  })
  navigation.dispatch(pushAction)
}

export { goBack, navigateSame }
