import React, { Component } from 'react'
import { IconButton } from 'react-native-paper'

const images = {
  google: require('../../assets/images/logos/google.png'),
  github: require('../../assets/images/logos/github.png'),
  facebook: require('../../assets/images/logos/facebook.png')
}

export default class extends Component {
  render() {
    return <IconButton icon={images[this.props.image]} size={26} onPress={this.props.onPress} />
  }
}
