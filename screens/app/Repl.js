import React, { useState, useEffect, useCallback } from 'react'
import { View, Clipboard, Platform, ToastAndroid, ScrollView, RefreshControl } from 'react-native'
import { useNavigation } from 'react-navigation-hooks'
import { Menu, List } from 'react-native-paper'
import { api } from '@replit/protocol'

import { navigateSame } from '../../lib/navigation'
import useMounted from '../../lib/useMounted'
import { moisten, setAtPath } from '../../lib/moisten'
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
    await crosis.connect()

    let closureFiles = files // For performance reasons, refactor later
    const fsevents = crosis.getChannel('fsevents')
    fsevents.on('command', (command) => {
      if (!mounted.current || command.body !== 'fileEvent') return

      switch (command.fileEvent.op) {
        case api.FileEvent.Op.Create: {
          closureFiles = setAtPath(
            closureFiles,
            command.fileEvent.file.path,
            command.fileEvent.file.type === api.File.Type.DIRECTORY ? 'folder' : 'file'
          )

          if (command.fileEvent.file.type === api.File.Type.DIRECTORY) {
            // TODO: Subscribe on first load too
            fsevents.send({
              subscribeFile: { files: [command.fileEvent.file.path] }
            })
          }

          setFiles(closureFiles)
          break
        }

        default: {
          console.log(`unknown fsevents op ${command.fileEvent.op}`)
        }
      }
    })

    console.log('requesting')
    await fsevents.send({
      subscribeFile: { files: ['.'] }
    })
    console.log('requested')

    if (!mounted.current) return
    setFiles(files)
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

    return () => crosis.closeChannel('fsevents')
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
