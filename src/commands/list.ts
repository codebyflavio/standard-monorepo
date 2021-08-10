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
    '$ standard-monorepo list --nodes # Shows all packages and their dependencies in an indexed table',
    '$ standard-monorepo list --since=gitsha --only=name,version --no-fork-point',
    '$ standard-monorepo list --since=$(git merge-base --fork-point main)',
    '$ standard-monorepo list --since=main --fork-point # same as above',
    '$ standard-monorepo list --since=main # same as above as --fork-point default is true',
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
    since: flags.string({
      description: 'list all packages that have changed since a git ref',
    }),
    'fork-point': flags.boolean({
      description:
        'list all packages that have changed since a fork point, using "git merge-base --fork-point $YOUR_REF"',
      default: true,
      allowNo: true,
    }),
  }

  async run() {
    const { flags } = this.parse(List)
    const packages = getAllPackages()

    if (flags.nodes) {
      const graph = new Graph(packages)

      this.log(printNodes(graph.nodes))
    } else if (flags.since) {
      const filesChanged = await getChangedFiles(
        flags.since,
        flags['fork-point'],
      )
      const graph = new Graph(packages)
      const changedPackages = graph.getChangedPackages(filesChanged)

      this.log(printPackages(changedPackages, flags.only).text)
    } else {
      this.log(printPackages(packages, flags.only).text)
    }
  }
}
