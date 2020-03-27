import { AsyncStorage } from 'react-native'
import { clearCookies } from 'react-native/Libraries/Network/RCTNetworking'

import isBinary, { maxBytes as isBinaryMaxBytes } from './isBinary'

function clearCookiesAsync() {
  return new Promise((resolve) => clearCookies(resolve))
}

function errorHandling(json, res) {
  if (json.message) {
    throw new Error(json.message)
  } else if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }
}

async function getCookies() {
  try {
    await clearCookiesAsync()
    const cookies = await AsyncStorage.getItem('@cookies')
    return cookies || ''
  } catch (error) {
    return ''
  }
}

const headers = async () => ({
  Referer: 'https://repl.it/uwu',
  'Content-Type': 'application/json',
  Cookie: await getCookies(),
  'X-Requested-With': 'replit-mobile'
})

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetch('https://repl.it/graphql', {
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

async function fetchRepls(after, folderId, search) {
  const result = await fetchGraphql(
    'dashboardRepls',
    `
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
          canWrite
        }
        pageInfo {
          hasNextPage
          nextCursor
        }
      }
    }
  `,
    { after, folderId, search, count: 20 }
  )

  return result
}

async function fetchFolders(parentId) {
  const result = await fetchGraphql(
    'replFoldersInId',
    `
    query replFoldersInId($parentId: String) {
      replFoldersInId(parentId: $parentId) {
        id
        name
      }
    }
  `,
    { parentId }
  )
  return result
}

async function deleteRepl(id) {
  await fetchGraphql(
    'deleteRepl',
    `
    mutation deleteRepl($id: String!) {
      deleteRepl(id: $id) {
        id
      }
    }
  `,
    { id }
  )
}

async function fetchFiles(url) {
  const res = await fetch(`https://repl.it/data/repls${url}`)
  const { fileNames } = await res.json()
  return fileNames
}

async function fetchInfo(url) {
  const result = await fetchGraphql(
    'repl',
    `
    query repl($url: String) {
      repl(url: $url) {
        ...as Repl {
          id
          title
          url
          language
          canWrite
        }
      }
    }
    `,
    { url }
  )
  return result
}

async function getUrls(id, file) {
  const res = await fetch(
    `https://repl.it/data/repls/signed_urls/${id}/${encodeURIComponent(file)}`,
    {
      headers: await headers()
    }
  )
  const json = await res.json()
  return json.urls_by_action
}

async function readFile(urls) {
  const res = await fetch(urls.read)
  const code = await res.text()
  return code
}

async function readFilePart(urls, size) {
  const res = await fetch(urls.read, {
    Range: `bytes=0-${size - 1}`
  })
  const code = await res.text()
  if (code.length === size) return code
  return await readFile(urls)
}

async function isFileBinary(urls) {
  const code = await readFilePart(urls, isBinaryMaxBytes)
  return isBinary(code)
}

async function writeFile(urls, code) {
  await fetch(urls.write, {
    method: 'PUT',
    body: code,
    headers: {
      'Content-Type': ' '
    }
  })
}

async function deleteFile(urls) {
  await fetch(urls.delete, {
    method: 'DELETE',
    headers: {
      'Content-Type': ' '
    }
  })
}

async function logIn(username, password) {
  if (!username || !password) throw new Error('Please enter a username and password!')
  const res = await fetch('https://repl.it/login', {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      username,
      password,
      teacher: false
    })
  })
  const json = await res.json()

  errorHandling(json, res)
  const cookies = res.headers.get('Set-Cookie').match(/connect.sid=.*?;/)[0]
  await AsyncStorage.setItem('@cookies', cookies || '')
  return json
}

async function signUp(username, email, password, captchaResponse) {
  if (!username || !email || !password) {
    throw new Error('Please enter a username, email, and password!')
  }

  const res = await fetch('https://repl.it/signup', {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({
      username,
      email,
      password,
      captchaResponse,
      teacher: false
    })
  })
  const json = await res.json()

  errorHandling(json, res)
  const cookies = res.headers.get('Set-Cookie')
  await AsyncStorage.setItem('@cookies', cookies || '')
}

async function logOut() {
  await AsyncStorage.clear()
}

async function getUserInfo() {
  const cookies = await getCookies()
  const res = await fetch('https://repl.it/is_authenticated', {
    headers: {
      Cookie: cookies,
      'X-Requested-With': 'replit-mobile'
    }
  })
  const json = await res.json()
  return json
}

async function updateEditorPreferences(editorPreferences) {
  await fetch('https://repl.it/data/user/editor_preferences/update', {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify(editorPreferences)
  })
}

async function fetchLanguages() {
  const res = await fetch('https://eval.repl.it/languages')
  const json = await res.json()
  errorHandling(json, res)

  return json.filter((language) => language.category !== 'Hidden')
}

async function createRepl(title = '', language = '', folderId) {
  const res = await fetch('https://repl.it/data/repls/new', {
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
  errorHandling(json, res)
  return json
}

async function forkRepl(id) {
  const res = await fetch(`https://repl.it/data/repls/${id}/fork`, {
    method: 'POST',
    headers: await headers()
  })

  const json = await res.json()
  errorHandling(json, res)
  return json
}

async function createFolder(name, parentId = '') {
  await fetchGraphql(
    'createReplFolder',
    `
    mutation createReplFolder($name: String!, $parentId: String!) {
      createReplFolder(name: $name, parentId: $parentId) {
        id
      }
    }
  `,
    { name, parentId }
  )
}

async function deleteFolder(id) {
  await fetchGraphql(
    'deleteReplFolder',
    `
    mutation deleteReplFolder($folderId: String!) {
      deleteReplFolder(folderId: $folderId) {
        id
      }
    }
  `,
    { folderId: id }
  )
}

async function getWebUrl(id) {
  const res = await fetch('https://replbox.repl.it/data/web_project/pushroute', {
    method: 'POST',
    headers: await headers(),
    body: JSON.stringify({ replId: id })
  })

  const json = await res.json()
  errorHandling(json, res)
  return `https://replbox.repl.it${json.url}`
}

export {
  fetchRepls,
  fetchFolders,
  fetchFiles,
  fetchInfo,
  logIn,
  signUp,
  logOut,
  getUserInfo,
  getUrls,
  readFile,
  isFileBinary,
  writeFile,
  deleteFile,
  createRepl,
  deleteRepl,
  forkRepl,
  createFolder,
  deleteFolder,
  fetchLanguages,
  getWebUrl,
  updateEditorPreferences
}
