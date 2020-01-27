import { AsyncStorage } from 'react-native'
import { Client } from '@replit/crosis'

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
    this.channels = {}
  }

  async connect() {
    if (this.client && this.client.connectionState === 1) {
      console.log('already connected')
      return
    }

    console.log('connecting')
    this.client = new Client()

    const cookies = await AsyncStorage.getItem('@cookies')
    const sid = cookies.split('=')[1].slice(0, -1) // TODO: Remake this
    console.log(`sid=${sid}, id=${this.id}`)

    const res = await fetch('https://CrosisServer.kognise.repl.co', {
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
    console.log(`token=${token}`)

    await this.client.connect({ token })
  }

  getChannel(service, name = wellKnown[service]) {
    return this.channels[service] || this.client.openChannel({ service, name })
  }
}
