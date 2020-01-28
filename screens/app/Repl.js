import React, { useState, useRef, useEffect, useCallback } from 'react'
import { View, Clipboard, Platform, ToastAndroid, ScrollView, RefreshControl } from 'react-native'
import { useNavigation } from 'react-navigation-hooks'
import { Menu, List } from 'react-native-paper'

import { navigateSame } from '../../lib/navigation'
import useMounted from '../../lib/useMounted'
import moisten from '../../lib/moisten'
import { fetchFiles, deleteRepl, forkRepl } from '../../lib/network'
import CrosisConnector from '../../lib/crosis'
import NewFile from '../../components/dialogButtons/fabs/NewFile'
import Theme from '../../components/wrappers/Theme'

const renderFiles = (files, onFilePress) => {
  const children = []

  for (let name in files) {
    const file = files[name]
    if (file.type === 'file') {
      children.push(
        <List.Item
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon="file" />}
          onPress={() => onFilePress(file.path)}
        />
      )
    } else {
      children.push(
        <List.Accordion
          title={name}
          key={name}
          left={(props) => <List.Icon {...props} icon="folder" />}
        >
          {renderFiles(file.content, onFilePress)}
        </List.Accordion>
      )
    }
  }

  return children
}

const Screen = () => {
  const mounted = useMounted()

  const navigation = useNavigation()
  const { navigate, getParam } = navigation
  const id = getParam('id')
  const url = getParam('url')
  const language = getParam('language')
  const canWrite = getParam('canWrite')

  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [crosis] = useState(new CrosisConnector(id))

  const load = useCallback(async () => {
    const flatFiles = await fetchFiles(url)
    const files = moisten(flatFiles)
    if (!mounted.current) return
    setFiles(files)
    await crosis.connect()
  }, [crosis, mounted, url])

  const reloadCurrent = useCallback(async () => {
    if (loading) return
    setLoading(true)
    await load()
    setLoading(false)
  }, [load, loading])

  const onFilePress = useCallback(
    (path) =>
      navigate('File', { id, path, language, canWrite, crosis, reloadPrevious: reloadCurrent }),
    [canWrite, crosis, id, language, navigate, reloadCurrent]
  )

  useEffect(() => {
    ;(async () => {
      await load()
      if (!mounted.current) return
      setLoading(false)
    })()
  }, [crosis, load, mounted])

  return (
    <Theme>
      <View style={{ flex: 1 }}>
        <ScrollView
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reloadCurrent} />}
          contentContainerStyle={{ minHeight: '100%' }}
        >
          {renderFiles(files, onFilePress)}
        </ScrollView>

        <NewFile id={id} reloadCurrent={reloadCurrent} navigate={navigate} crosis={crosis} />
      </View>
    </Theme>
  )
}

Screen.navigationOptions = ({ navigation }) => ({
  title: navigation.getParam('title', 'Files'),
  menu: (closeMenu) => (
    <>
      <Menu.Item
        title="Copy link"
        onPress={() => {
          closeMenu()
          const url = navigation.getParam('url')
          Clipboard.setString(`https://repl.it${url}`)
          if (Platform.OS === 'android') {
            ToastAndroid.show('Link copied', ToastAndroid.SHORT)
          }
        }}
      />
      <Menu.Item
        title="Fork"
        onPress={async () => {
          closeMenu()

          const id = navigation.getParam('id')
          const reloadPrevious = navigation.getParam('reloadPrevious')

          const newRepl = await forkRepl(id)
          reloadPrevious() // So the repl listing is updated with the new repl
          navigateSame(navigation, {
            ...navigation.state.params,
            id: newRepl.id,
            title: newRepl.title,
            url: newRepl.url,
            language: newRepl.language,
            canWrite: true
          })
        }}
      />
      {navigation.getParam('canWrite') ? (
        <Menu.Item
          title="Delete"
          onPress={async () => {
            closeMenu()

            const id = navigation.getParam('id')
            const reloadPrevious = navigation.getParam('reloadPrevious')

            await deleteRepl(id)
            reloadPrevious()
            navigation.goBack()
          }}
        />
      ) : null}
    </>
  )
})

export default Screen
