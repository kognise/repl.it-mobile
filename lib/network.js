import fr from '@zeit/fetch-retry'
const fetchr = fr(fetch)

const base = 'https://repl.it/'
const graphql = `${base}graphql`

const sid = 's%3AHKPDumQc3FQqRJzWkfwqO-qOWhqV3Nb_.S%2FxUZIFVaG7u6jKCnFwv7SNy0V1vMYQmYmyYeFhH778' // FIXME: REMOVE THIS!
const headers = {
  'Referer': base,
  'Content-Type': 'application/json',
  'Cookie': `connect.sid=${sid}`
}

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetchr(graphql, {
    method: 'POST',
    body: JSON.stringify({ operationName, query, variables }),
    headers
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
    headers
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
  const res = await this.fetch(`https://repl.it/data/repls/signed_urls/${id}/${encodeURIComponent(file)}?d=${Date.now()}`)
  const json = await res.json()

  const readUrl = json.urls_by_action.read
  const res2 = await this.fetch(readUrl)
  return await res2.text()
}

export { fetchGraphql, fetchDashboard, genToken, readFile }