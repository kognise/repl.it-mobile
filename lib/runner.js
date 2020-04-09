import { EventEmitter } from 'events'

import { api } from '@replit/protocol'

export default class Runner extends EventEmitter {
  constructor(crosis) {
    super()

    this.crosis = crosis

    this.packagerSupported = true
    this.interpSupported = true

    this.packager = null
    this.interp = null
    this.runner = null
  }

  async install() {
    if (!this.packagerSupported) {
      this.emit('state', 'stopped')
      return
    }

    this.emit('state', 'installing')

    await new Promise((resolve) => {
      if (!this.packager) {
        this.packager = this.crosis.getChannel('packager3')

        this.packager.on('command', (command) => {
          if (command.body === 'output') {
            this.emit('log', command.output)
          }
        })

        this.packager.on('error', () => {
          console.log('packager not supported!')
          this.packagerSupported = false
          resolve() // The packager request will never resolve if there's an error
        })
      }

      this.packager.request({ packageInstall: {} }).then(resolve)
    })

    this.emit('state', 'stopped')
  }

  async run() {
    this.emit('state', 'running')

    if (this.interpSupported) {
      if (!this.interp) {
        this.interp = this.crosis.getChannel('interp2')

        this.interp.on('command', (command) => {
          switch (command.body) {
            case 'output': {
              this.emit('log', command.output)
              break
            }

            case 'state': {
              this.emit('state', command.state === api.State.Running ? 'running' : 'stopped')
              break
            }
          }
        })

        this.interp.on('error', () => {
          console.log('interp not supported, falling back to run2!')
          this.interpSupported = false
          this.run()
        })
      }

      await this.interp.request({ runMain: {} })
    } else {
      if (!this.runner) {
        this.runner = this.crosis.getChannel('run2')

        this.runner.on('command', (command) => {
          switch (command.body) {
            case 'output': {
              this.emit('log', command.output)
              break
            }

            case 'state': {
              this.emit('state', command.state === api.State.Running ? 'running' : 'stopped')
              break
            }
          }
        })
      }

      await this.runner.request({ runMain: {} })
    }
  }

  async clear() {
    if (this.interpSupported && this.interp) {
      await this.interp.request({ clear: {} })
    } else if (this.runner) {
      await this.runner.request({ clear: {} })
    }
  }

  disconnect() {
    if (this.packager) {
      this.packager.removeAllListeners()
      this.packager = null
    }

    if (this.interp) {
      this.interp.removeAllListeners()
      this.interp = null
    }

    if (this.runner) {
      this.runner.removeAllListeners()
      this.runner = null
    }
  }
}
