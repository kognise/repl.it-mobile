import fr from '@zeit/fetch-retry'
import { AsyncStorage } from 'react-native'
const fetchr = fr(fetch)

const base = 'https://repl.it/'

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
  'Cookie': `connect.sid=${await getSid()};`,
  'X-Requested-With': 'replit-mobile'
})

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetchr(`${base}graphql`, {
    method: 'POST',
    body: JSON.stringify({ operationName, query, variables }),
    headers: await headers()
  })
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }

  return json.data[operationName]
}

// async function genToken(id) {
//   const res = await fetchr(`${base}graphql`, {
//     method: 'POST',
//     body: JSON.stringify({
//       liveCodingToken: null,
//       polygott: false // TODO: Add polygott support
//     }),
//     headers: await headers()
//   })

//   const potentialToken = await res.json()
//   if (potentialToken.message) {
//     if (potentialToken.name) {
//       throw new Error(`${potentialToken.name}: ${potentialToken.message}`)
//     } else {
//       throw new Error(potentialToken.message)
//     }
//   } else {
//     return potentialToken
//   }
// }

async function fetchRepls(after, folderId) {
  const result = await fetchGraphql('dashboardRepls', `
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
          title
          language
          description
          url
        }
        pageInfo {
          hasNextPage
          nextCursor
        }
      }
    }
  `, { after, folderId, count: 20 })
  return result
}

async function fetchFolders(parentId) {
  const result = await fetchGraphql('replFoldersInId', `
    query replFoldersInId($parentId: String) {
      replFoldersInId(parentId: $parentId) {
        id
        name
      }
    }
  `, { parentId })
  return result
}

async function deleteRepl(id) {
  await fetchGraphql('deleteRepl', `
    mutation deleteRepl($id: String!) {
      deleteRepl(id: $id) {
        id
      }
    }
  `, { id })
}

async function fetchFiles(url) {
  const res = await fetchr(`${base}data/repls${url}`)
  const { fileNames } = await res.json()
  return fileNames
}

async function getUrls(id, file) {
  const res = await fetchr(`${base}data/repls/signed_urls/${id}/${encodeURIComponent(file)}`, {
    headers: await headers()
  })
  const json = await res.json()
  return json.urls_by_action
}

async function readFile(urls) {
  const res = await fetchr(urls.read)
  const code = await res.text()
  return code
}

async function writeFile(urls, code) {
  await fetchr(urls.write, {
    method: 'PUT',
    body: code,
    headers: {
      'Content-Type': ' '
    }
  })
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
    const sid = res.headers.get('Set-Cookie').match(/connect\.sid=(.+)/)[1].split(';')[0]
    await AsyncStorage.setItem('@sid', sid || '')
    return { username }
  }
}

async function signUp(username, email, password, captchaResponse) {
  if (!username || !email || !password) {
    throw new Error('Please enter a username, email, and password!')
  }

  const res = await fetchr(`${base}signup`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      username, email, password,
      captchaResponse,
      teacher: false
    })
  })
  const json = await res.json()

  if (json.message) {
    throw new Error(json.message)
  } else if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }
  const sid = res.headers.get('Set-Cookie').match(/connect\.sid=(.+)/)[1].split(';')[0]
  await AsyncStorage.setItem('@sid', sid || '')
}

async function logOut() {
  await AsyncStorage.clear()
}

async function isLoggedIn() {
  const sid = await getSid()
  if (!sid) return false
  const res = await fetchr(`${base}is_authenticated`, {
    headers: {
      'Cookie': `connect.sid=${sid};`,
      'Referer': base,
      'X-Requested-With': 'replit-mobile'
    }
  })
  const json = await res.json()
  return json.success
}

async function fetchLanguages() {
  const res = await fetchr(`https://eval.repl.it/languages`)
  if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }
  const json = await res.json()
  json.push({
    name: 'html',
    displayName: 'HTML, CSS, JS'
  })
  return json
}

async function createRepl(title = '', language = '', folderId) {
  const res = await fetchr(`${base}data/repls/new`, {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      description: '',
      isPrivate: false,
      folderId,
      language,
      title
    })
  })
  const json = await res.json()
  if (json.message) {
    throw new Error(json.message)
  } else if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }
  return json
}

export {
  fetchRepls, fetchFolders, fetchFiles,
  logIn, signUp, logOut, isLoggedIn,
  getUrls, readFile, writeFile,
  createRepl, deleteRepl, fetchLanguages
}