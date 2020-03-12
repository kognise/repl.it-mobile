import { EventEmitter } from 'events'

// TODO: flesh out
export default class OTClient extends EventEmitter {
  channel = null
  file = null
  version = -1
  queue = []

  constructor(crosis) {
    super()
    this.crosis = crosis
  }

  connect(file) {
    this.channel = this.crosis.getChannel('ot', `ot:${file}`)
    this.file = file

    this.channel.on('command', (command) => {
      switch (command.body) {
        case 'ot': {
          return this.handlePacket(command.ot)
        }

        case 'otstatus': {
          return this.handleStatus(command.otstatus)
        }

        case 'error': {
          return this.emit('error', new Error(command.error || 'Server error!'))
        }

        case 'otNewCursor': {
          return this.emit('cursor', command.otNewCursor)
        }

        case 'otDeleteCursor': {
          return this.emit('removeCursor', command.otDeleteCursor.id)
        }
      }
    })

    this.channel.on('error', (error) => this.emit('error', new Error(error.message)))
    this.channel.on('close', () => console.log('ot channel closed'))
  }

  disconnect() {
    console.log('disconnecting')
    this.crosis.closeChannel('ot', `ot:${this.file}`)
    this.channel = null
    this.file = null
  }

  handlePacket({ version, ops }) {
    if (this.version === -1) {
      this.version = 0
    } else if (version <= this.version) {
      return
    }

    // TODO: verify crc32 and refactor

    this.version = version
    this.emit('ot', ops)

    if (this.queue.length > 0) {
      for (let ops of this.queue) {
        this.sendOps(ops)
      }
      this.queue = []
    }
  }

  async sendOps(ops) {
    this.emit('outgoing')
    if (this.version === -1 || !this.channel) {
      this.queue.push(ops)
    } else {
      // TODO: send crc32?
      await this.channel.request({ ot: { version: this.version++, ops } })
    }
  }

  async handleStatus(status) {
    if (this.version !== -1) return

    if (status.linkedFile) {
      console.log('already linked')
      this.file = status.linkedFile
    } else {
      console.log('linking file')
      await this.channel.request({ otLinkFile: { file: { path: this.file } } })
    }

    this.version = status.version || 0
    if (status.contents) {
      this.emit('replace', status.contents)
    }
  }
}
