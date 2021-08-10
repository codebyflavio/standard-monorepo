import { Command, flags } from '@oclif/command'
import getAllPackages from '../core/allPackages'
import { Graph } from '../core/graph'
import { padMessage, getCircularDepsMessage } from '../core/message'

export default class CircularDeps extends Command {
  static description = 'List all the circular dependencies in the monorepo'

  static examples = [
    '$ standard-monorepo circular-deps',
    '$ standard-monorepo circular-deps --max=5 --max-total-paths=10 # default is 0 for both',
  ]

  static args = []

  static flags = {
    help: flags.help({ char: 'h' }),
    max: flags.integer({
      description: 'maximum allowed individual circular dependencies',
      default: 0,
    }),
    'max-total-paths': flags.integer({
      description: 'maximum allowed circular dependencies paths',
      default: 0,
    }),
  }

  async run() {
    const { flags } = this.parse(CircularDeps)

    const packages = getAllPackages()
    const graph = new Graph(packages)
    const circDeps = graph.detectCycle()
    const message = getCircularDepsMessage(circDeps, flags)

    const handler = message.type === 'fail' ? this.error : this.log
    handler(padMessage(message))
  }
}
