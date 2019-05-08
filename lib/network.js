import fr from '@zeit/fetch-retry'
import { AsyncStorage } from 'react-native'
import { clearCookies } from 'RCTNetworking'
const fetchr = fr(fetch)

function clearCookiesAsync() {
  return new Promise((resolve) => clearCookies(resolve))
}

async function getCookies() {
  try {
    await clearCookiesAsync()
    const cookies = await AsyncStorage.getItem('@cookies')
    return cookies || ''
  } catch(error) {
    return ''
  }
}

const headers = async () => ({
  'Referer': 'https://repl.it/',
  'Content-Type': 'application/json',
  'Cookie': await getCookies(),
  'X-Requested-With': 'replit-mobile'
})

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetchr('https://repl.it/graphql', {
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
  const res = await fetchr(`https://repl.it/data/repls${url}`)
  const { fileNames } = await res.json()
  return fileNames
}

async function getUrls(id, file) {
  const res = await fetchr(`https://repl.it/data/repls/signed_urls/${id}/${encodeURIComponent(file)}`, {
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

async function deleteFile(urls) {
  await fetchr(urls.delete, {
    method: 'DELETE',
    headers: {
      'Content-Type': ' '
    }
  })
}

async function logIn(username, password) {
  if (!username || !password) throw new Error('Please enter a username and password!')
  const res = await fetchr('https://repl.it/login', {
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
    const cookies = res.headers.get('Set-Cookie').match(/connect.sid=.*?;/)[0]
    await AsyncStorage.setItem('@cookies', cookies || '')
    return { username }
  }
}

async function signUp(username, email, password, captchaResponse) {
  if (!username || !email || !password) {
    throw new Error('Please enter a username, email, and password!')
  }

  const res = await fetchr('https://repl.it/signup', {
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
  const cookies = res.headers.get('Set-Cookie')
  await AsyncStorage.setItem('@cookies', cookies || '')
}

async function logOut() {
  await AsyncStorage.clear()
}

async function isLoggedIn() {
  const cookies = await getCookies()
  if (!cookies) return false
  const res = await fetchr('https://repl.it/is_authenticated', {
    headers: {
      'Cookie': cookies,
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
  const res = await fetchr('https://repl.it/data/repls/new', {
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

async function getWebUrl(id) {
  const res = await fetch('https://replbox.repl.it/data/web_project/pushroute', {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ replId: id })
  })

  const json = await res.json()
  if (json.message) {
    throw new Error(json.message)
  } else if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }
  return `https://replbox.repl.it${json.url}`
}

export {
  fetchRepls, fetchFolders, fetchFiles,
  logIn, signUp, logOut, isLoggedIn,
  getUrls, readFile, writeFile, deleteFile,
  createRepl, deleteRepl, fetchLanguages,
  getWebUrl
}