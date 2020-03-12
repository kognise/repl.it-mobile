import React, { forwardRef } from 'react'

import SettingsContext from '../components/wrappers/SettingsContext'

export default (FML) => {
  const FMLx2 = forwardRef((props, ref) => (
    <SettingsContext.Consumer>
      {(context) => <FML {...props} ref={ref} context={context} />}
    </SettingsContext.Consumer>
  ))
  FMLx2.navigationOptions = FML.navigationOptions
  return FMLx2
}
