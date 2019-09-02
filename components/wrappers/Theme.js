import React, { Component } from 'react'
import { withTheme } from 'react-native-paper'

export default withTheme(
  class extends Component {
    render() {
      const children = React.Children.map(this.props.children, (child) => {
        return React.cloneElement(child, {
          ...child.props,
          contentContainerStyle: {
            ...child.props.contentContainerStyle,
            backgroundColor: this.props.theme.colors.background
          },
          style: {
            ...child.props.style,
            backgroundColor: this.props.theme.colors.background
          }
        })
      })
      return children
    }
  }
)
