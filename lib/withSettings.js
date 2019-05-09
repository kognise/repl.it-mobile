import React, { forwardRef } from 'react'
import SettingsContext from '../components/SettingsContext'

export default (FML) => forwardRef((props, ref) => (
  <SettingsContext.Consumer>
    {(context) => (
      <FML {...props} ref={ref} context={context} />
    )}
  </SettingsContext.Consumer>
))