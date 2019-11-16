import fr from '@zeit/fetch-retry'
import { AsyncStorage } from 'react-native'
import { Client } from '@replit/crosis'

const fetchr = fr(fetch)

export default class CrosisConnector {
  constructor(id) {
    this.id = id
    this.client = new Client()
  }

  async connect() {
    const cookies = await AsyncStorage.getItem('@cookies')
    const sid = cookies // FIXME: Extract SID and eventually remake

    const res = await fetchr('https://CrosisServer.kognise.repl.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sid,
        id: this.id
      })
    })
    const { token } = await res.json()

    await this.client.connect({
      tokenOptions: { token }
    })
  }

  openChannel(service, name) {
    return this.client.openChannel({
      service,
      name
    })
  }
}
