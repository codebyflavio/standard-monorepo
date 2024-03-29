import { Command, flags } from '@oclif/command'
import getAllPackages from '../core/allPackages'
import getChangedFiles from '../core/changedFiles'
import { printPackages, printNodes } from '../core/message'
import { Graph } from '../core/graph'

const toExample = (example) => JSON.stringify(example, null, 2)

export default class List extends Command {
  static description = 'List all the packages in the monorepo as json'

  static examples = [
    '$ standard-monorepo list',
    '$ standard-monorepo list >> list.json',
    '$ standard-monorepo list --only="name,version"',
    toExample([
      { name: 'a', version: '1.0.0' },
      { name: 'b', version: '1.0.0' },
      { name: 'c', version: '1.0.0' },
    ]),
    '$ standard-monorepo list --only="name,version,private,location,dependencies,devDependencies,peerDependencies,optionalDependencies"',
    '$ standard-monorepo list --only="name" --filter="foo"',
    '$ standard-monorepo list --nodes # Shows all packages and their dependencies in an indexed table',
    '$ standard-monorepo list --since=gitsha --only=name,version',
    '$ standard-monorepo list --since=$(git merge-base main HEAD)',
  ]

  static args = []

  static flags = {
    help: flags.help({ char: 'h' }),
    nodes: flags.boolean({
      description: 'list a representation of the dependency graph',
      exclusive: ['only', 'since'],
    }),
    only: flags.string({
      description: 'fields to return for each package',
      default: 'name,version,private,location',
    }),
    filter: flags.string({
      description: 'glob to filter packages',
    }),
    since: flags.string({
      description: 'list all packages that have changed since a git ref',
    }),
  }

  async run() {
    const { flags } = this.parse(List)
    const packages = getAllPackages()

    if (flags.nodes) {
      const graph = new Graph(packages)

      this.log(printNodes(graph.nodes))
    } else if (flags.since) {
      const filesChanged = await getChangedFiles(flags.since)
      const graph = new Graph(packages)
      const changedPackages = graph.getChangedPackages(filesChanged)

      this.log(printPackages(changedPackages, flags.only, flags.filter).text)
    } else {
      this.log(printPackages(packages, flags.only, flags.filter).text)
    }
  }
}
