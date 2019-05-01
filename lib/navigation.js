import { StackActions, NavigationActions } from 'react-navigation'
import { Animated, Easing }  from 'react-native'

function goBack(navigation) {
  const backAction = StackActions.pop({ n: 1 })
  navigation.dispatch(backAction)
}

function transitionConfig() {
  return {
    transitionSpec: {
      duration: 750,
      easing: Easing.out(Easing.poly(4)),
      timing: Animated.timing,
      useNativeDriver: true
    },
    screenInterpolator: (props) => {      
      const { layout, position, scene } = props

      const translateX = position.interpolate({
        inputRange: [ scene.index - 1, scene.index ],
        outputRange: [ layout.initWidth, 0 ],
      })
      return { transform: [ { translateX } ] }
    }
  }
}

export { goBack, transitionConfig }