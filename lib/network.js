import fr from '@zeit/fetch-retry'
import { AsyncStorage } from 'react-native'
const fetchr = fr(fetch)

const base = 'https://repl.it/'
const graphql = `${base}graphql`

async function getSid() {
  try {
    const sid = await AsyncStorage.getItem('@sid')
    return sid || ''
  } catch(error) {
    return ''
  }
}

const headers = async () => ({
  'Referer': base,
  'Content-Type': 'application/json',
  'Cookie': `connect.sid=${await getSid()};`
})

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetchr(graphql, {
    method: 'POST',
    body: JSON.stringify({ operationName, query, variables }),
    headers: await headers()
  })
  if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

async function genToken(id) {
  const res = await fetchr(graphql, {
    method: 'POST',
    body: JSON.stringify({
      liveCodingToken: null,
      polygott: false // TODO: Add polygott support
    }),
    headers: await headers()
  })

  const potentialToken = await res.json()
  if (potentialToken.message) {
    if (potentialToken.name) {
      throw new Error(`${potentialToken.name}: ${potentialToken.message}`)
    } else {
      throw new Error(potentialToken.message)
    }
  } else {
    return potentialToken
  }
}

async function fetchDashboard(after) {
  const data = await fetchGraphql('dashboardRepls', `
    query dashboardRepls(
      $count: Int,
      $after: String,
      $lang: String,
      $search: String,
      $folderId: String
    ) {
      dashboardRepls(
        count: $count,
        after: $after,
        lang: $lang,
        search: $search, 
        folderId: $folderId
      ) {
        items {
          id
          slug
          title
          language
          timeCreated
          folderId
          description
          isRenamed
        }
        pageInfo {
          hasNextPage
          nextCursor
        }
      }
    }
  `, { after, count: 20 })
  return data.dashboardRepls
}

async function readFile(id, file) {
  const res = await fetchr(`${base}data/repls/signed_urls/${id}/${encodeURIComponent(file)}?d=${Date.now()}`)
  const json = await res.json()

  const readUrl = json.urls_by_action.read
  const res2 = await fetchr(readUrl)
  return await res2.text()
}

async function logIn(username, password) {
  if (!username || !password) throw new Error('Please enter a username and password!')
  const res = await fetchr(`${base}login`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      username, password,
      teacher: false
    })
  })
  const json = await res.json()

  if (json.message) {
    throw new Error(json.message)
  } else if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  } else {
    const { username } = json
    const sid = res.headers.get('Set-Cookie').match(/connect\.sid=(.+);/)[1].split(';')[0]
    await AsyncStorage.setItem('@sid', sid || '')
    return { username }
  }
}

async function logOut(navigation) {
  await AsyncStorage.removeItem('@sid')
}

async function isLoggedIn() {
  const sid = await getSid()
  if (!sid) return false
  const res = await fetchr(`${base}repls`, {
    headers: { 'Cookie': `connect.sid=${sid};` }
  })
  return !res.url.includes('login')
}

export { fetchGraphql, fetchDashboard, genToken, readFile, logIn, logOut, isLoggedIn }