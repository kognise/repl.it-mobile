import React, { Component } from 'react'
import { View } from 'react-native'

import { fetchInfo, fetchCanWrite } from '../../lib/network'

import Theme from '../../components/Theme'
import ActivityIndicator from '../../components/ActivityIndicator'

export default class extends Component {
  render() {
    return (
      <Theme>
        <View style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <ActivityIndicator />
        </View>
      </Theme>
    )
  }

  async componentDidMount() {
    const { replace, getParam } = this.props.navigation
    const info = await fetchInfo(getParam('url'))
    const canWrite = await fetchCanWrite(info.id)
    replace('Repl', {
      id: info.id,
      title: info.title,
      url: info.url,
      language: info.language,
      canWrite,
      reload: getParam('reload')
    })
  }
}