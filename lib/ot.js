import { EventEmitter } from 'events'

// TODO: flesh out
export default class OTClient extends EventEmitter {
  version = -1
  queue = []

  connect(channel) {
    this.channel = channel

    this.channel.on('command', (command) => {
      switch (command.body) {
        case 'ot':
          return this.handlePacket(command.ot)

        case 'otstatus':
          return this.handleStatus(command.otstatus)

        case 'error':
          return this.emit('error', new Error(command.error || 'Server error!'))

        case 'otNewCursor':
          return this.emit('cursor', command.otNewCursor)

        case 'otDeleteCursor':
          return this.emit('removeCursor', command.otDeleteCursor.id)
      }
    })

    this.channel.on('error', (error) => this.emit('error', new Error(error.message)))
  }

  handlePacket({ version, ops }) {
    // TODO: verify crc32 and refactor
    if (version <= this.version) return

    this.version = version
    this.emit('ot', ops)
    console.log('GOT OT PACKET', `${this.version}/${version}`, ops)

    if (this.queue.length > 0) {
      for (let ops of this.queue) {
        this.sendOps(ops)
      }
      this.queue = []
    }
  }

  async sendOps(ops) {
    if (this.version === -1 || !this.channel) {
      console.log('SENDING OP TO QUEUE')
      this.queue.push(ops)
    } else {
      console.log('SENDING REAL OP', ops)
      // TODO: send crc32?
      await this.channel.request({ ot: { version: this.version++, ops } })
    }
  }

  handleStatus(status) {
    if (status.version) {
      this.version = status.version
    }
    if (status.contents) {
      console.log('OT STATUS GOT CONTENTS')
      this.emit('replace', status.contents)
    }
  }
}
