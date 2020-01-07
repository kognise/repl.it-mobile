import React, { useRef, useState, useEffect, useCallback } from 'react'
import { View, ScrollView, RefreshControl } from 'react-native'
import { useNavigation } from 'react-navigation-hooks'
import { Menu, Searchbar, List } from 'react-native-paper'

import { navigateSame } from '../../lib/navigation'
import useMounted from '../../lib/useMounted'
import { fetchRepls, fetchFolders } from '../../lib/network'
import NewFolder from '../../components/dialogButtons/menuItems/NewFolder'
import DeleteFolder from '../../components/dialogButtons/menuItems/DeleteFolder'
import NewRepl from '../../components/dialogButtons/fabs/NewRepl'
import Theme from '../../components/wrappers/Theme'

const Screen = () => {
  const mounted = useMounted()

  const navigation = useNavigation()
  const { navigate, getParam, setParams } = navigation
  const folderId = getParam('folderId')

  const pageInfoRef = useRef({})
  const [folders, setFolders] = useState([])
  const [repls, setRepls] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    const { items, pageInfo } = await fetchRepls(undefined, folderId, search)
    const folders = await fetchFolders(folderId)
    pageInfoRef.current = pageInfo
    if (!mounted.current) return
    setRepls(items)
    setFolders(folders)
  }, [folderId, mounted, search])

  const reloadCurrent = useCallback(async () => {
    if (loading) return
    setLoading(true)
    await load()
    setLoading(false)
  }, [load, loading])
  useEffect(() => {
    // So we can reload after creating folders in the menu
    setParams({ reloadCurrent })
  }, [reloadCurrent]) // eslint-disable-line react-hooks/exhaustive-deps

  const onScroll = (event) => {
    if (loading) return
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 60) {
      setLoading(true)
      // TODO: fetch
      if (!mounted.current) return
      setLoading(false)
    }
  }

  useEffect(() => {
    ;(async () => {
      await load()
      if (!mounted.current) return
      setLoading(false)
    })()
  }, [load, mounted])

  return (
    <Theme>
      <View style={{ padding: 10 }}>
        <Searchbar
          placeholder="Search"
          onChangeText={setSearch}
          onSubmitEditing={load}
          value={search}
        />
      </View>
      <View style={{ flex: 1 }}>
        <ScrollView
          scrollEventThrottle={16}
          onScroll={onScroll}
          onMomentumScrollEnd={onScroll}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={reloadCurrent} />}
          contentContainerStyle={{ minHeight: '100%' }}
        >
          {folders.map((folder) => (
            <List.Item
              title={folder.name}
              key={folder.id}
              onPress={() =>
                navigateSame(navigation, {
                  folderId: folder.id,
                  reloadPrevious: reloadCurrent,
                  name: folder.name
                })
              }
              left={(props) => <List.Icon {...props} icon="folder" />}
            />
          ))}
          {repls.map((repl) => (
            <List.Item
              title={repl.title}
              description={`A ${repl.language} repl`}
              key={repl.id}
              onPress={() =>
                navigate('Repl', {
                  id: repl.id,
                  title: repl.title,
                  url: repl.url,
                  language: repl.language,
                  canWrite: repl.canWrite,
                  reloadPrevious: reloadCurrent
                })
              }
              left={(props) => <List.Icon {...props} icon="file" />}
            />
          ))}
        </ScrollView>
        <NewRepl folderId={folderId} reloadCurrent={reloadCurrent} navigate={navigate} />
      </View>
    </Theme>
  )
}

Screen.navigationOptions = ({ navigation }) => {
  const root = !navigation.getParam('name')
  return {
    title: navigation.getParam('name', 'Your Repls'),
    menu: (closeMenu) => (
      <>
        <NewFolder
          closeMenu={closeMenu}
          id={navigation.getParam('folderId')}
          reloadCurrent={() => navigation.getParam('reloadCurrent')()}
        />
        {navigation.getParam('name') !== 'Unnamed' && !root ? (
          <DeleteFolder
            closeMenu={closeMenu}
            id={navigation.getParam('folderId')}
            reloadPrevious={navigation.getParam('reloadPrevious')}
            goBack={navigation.goBack}
          />
        ) : null}
        {root ? (
          <Menu.Item
            title="Settings"
            onPress={() => {
              closeMenu()
              navigation.navigate('Settings')
            }}
          />
        ) : null}
      </>
    )
  }
}

export default Screen
