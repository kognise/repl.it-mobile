import React from 'react'
import { View } from 'react-native'
import { Checkbox, Text, useTheme } from 'react-native-paper'

export default ({ label, checked, setChecked, style = {} }) => {
  const theme = useTheme()

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        ...style
      }}
    >
      <Checkbox
        status={checked ? 'checked' : 'unchecked'}
        color={theme.colors.primary}
        onPress={() => setChecked && setChecked(!checked)}
      />
      <Text style={{ fontSize: 16, flex: 1 }} onPress={() => setChecked && setChecked(!checked)}>
        {label}
      </Text>
    </View>
  )
}
