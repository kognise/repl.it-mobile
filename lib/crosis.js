import fr from '@zeit/fetch-retry'
import { AsyncStorage } from 'react-native'
import { Client } from '@replit/crosis'

const fetchr = fr(fetch)

const wellKnown = {
  chat: 'chatter',
  eval: 'evaler',
  interp: 'interper',
  interp2: 'interper',
  packager2: 'packager',
  packager3: 'packager',
  presence: 'presencer',
  run: 'runner',
  run2: 'runner',
  shell: 'sheller'
}

export default class CrosisConnector {
  constructor(id) {
    this.id = id
    this.client = new Client()
    this.channels = {}
  }

  async connect() {
    console.log(`(${new Date().toLocaleTimeString()} connecting)`)
    const cookies = await AsyncStorage.getItem('@cookies')
    const sid = cookies.split('=')[1] // TODO: Remake this
    console.log(`(${new Date().toLocaleTimeString()} sid=${sid})`)

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
    console.log(`(${new Date().toLocaleTimeString()} token=${token})`)

    await this.client.connect({ token })
  }

  getChannel(service) {
    return (
      this.channels[service] ||
      this.client.openChannel({
        service,
        name: wellKnown[service]
      })
    )
  }
}
