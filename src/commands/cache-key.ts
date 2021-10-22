import { Command, flags } from '@oclif/command'
import appRoot from 'app-root-path'
import path from 'path'
import md5File from 'md5-file'
import md5 from 'md5'
import { getAllPackages } from '../core/allPackages'

export default class CacheKey extends Command {
  static description = 'Monorepo node_modules cache key'

  static examples = [
    '$ standard-monorepo cache-key # 93ead503b3bc9b08c2e07da10ef34162',
  ]

  static args = []

  static flags = {
    help: flags.help({ char: 'h' }),
    cwd: flags.boolean({
      description:
        'use the context from where the command was run to determine root of the monorepo',
      default: false,
    }),
  }

  async run() {
    const { flags } = this.parse(CacheKey)

    const context = flags.cwd ? process.cwd() : appRoot.path
    const packages = getAllPackages(context)

    const inputs = [
      ...packages.map(({ location }) => location),
      path.join(context, 'package.json'),
      path.join(context, 'yarn.lock'),
    ]

    const cacheKey = inputs
      .map(md5File.sync)
      .reduce((acc: string, cur: string) => md5(acc + cur), '') as string

    this.log(cacheKey)
  }
}
