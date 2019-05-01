import React, { Component } from 'react'
import { Image } from 'react-native'
import { IconButton } from 'react-native-paper'

const images = {
  google: require('../assets/google.png'),
  github: require('../assets/github.png'),
  facebook: require('../assets/facebook.png')
}

export default class extends Component {
  render() {
    return (
      <IconButton
        icon={({ size }) => (
          <Image
            source={images[this.props.image]}
            style={{ width: size, height: size }}
          />
        )}
        size={this.props.size}
        onPress={this.props.onPress}
      />
    )
  }
}