const base = 'https://repl.it/'
const graphql = `${base}graphql`

const sid = 's%3AHKPDumQc3FQqRJzWkfwqO-qOWhqV3Nb_.S%2FxUZIFVaG7u6jKCnFwv7SNy0V1vMYQmYmyYeFhH778' // FIXME: REMOVE THIS!

async function fetchGraphql(operationName = '', query = '', variables = {}) {
  const res = await fetch(graphql, {
    method: 'POST',
    headers: {
      'Referer': base,
      'Content-Type': 'application/json',
      'Cookie': `connect.sid=${sid}`
    },
    body: JSON.stringify({ operationName, query, variables })
  })
  if (!res.ok) {
    throw new Error(`Network error! ${res.statusText} (${res.status})`)
  }

  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

async function fetchDashboard(from) {
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
  `, { from, count: 20 })
  const items = data.dashboardRepls.items
  return items
}

export { fetchGraphql, fetchDashboard }