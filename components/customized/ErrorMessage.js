import React from 'react'
import { Text, withTheme } from 'react-native-paper'

export default withTheme((props) =>
  props.error ? (
    <Text style={{ color: props.theme.colors.error, marginBottom: props.marginBottom }}>
      {props.error}
    </Text>
  ) : null
)
