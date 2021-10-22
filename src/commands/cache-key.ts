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
    '$ standard-monorepo cache-key --cwd # 93ead503b3bc9b08c2e07da10ef34162',
    '$ standard-monorepo cache-key --github # ::set-output name=cacheKey::{env.PREFIX}-93ead503b3bc9b08c2e07da10ef34162',
    `- name: Get nodemodules cache key
        id: cache-key
        shell: bash
        run: npx standard-monorepo cache-key
        env:
          PREFIX: ubuntu-latest-node-14.16.0
          
      - name: Cache node modules
        id: cache-node-modules
        uses: actions/cache@v2
        env:
          cache-name: cache-node-modules
        with:
          path: |
            node_modules
            **/node_modules
          key: steps.cache-key.outputs.cacheKey
          restore-keys: steps.cache-key.outputs.cacheKey`,
  ]

  static args = []

  static flags = {
    help: flags.help({ char: 'h' }),
    cwd: flags.boolean({
      description:
        'use the context from where the command was run to determine root of the monorepo',
      default: false,
    }),
    github: flags.boolean({
      description: 'print github actions output',
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

    const prefix = process.env.PREFIX

    this.log(
      flags.github
        ? `::set-output name=cacheKey::${prefix ? `${prefix}-` : ''}${cacheKey}`
        : cacheKey,
    )
  }
}
