import { defaultTo, flattenDeep } from 'lodash'
import { join } from 'path'
import Glob from 'glob'

import { Package, PackageJson } from './types'

const findByGlob = (context: string, glob: string): Package[] => {
  const packageJsonGlob = join(context, '/', glob, '/package.json')

  return Glob.sync(packageJsonGlob)
    .map((location) => {
      if (location.includes('node_modules')) return null
      const {
        name,
        version,
        private: priv = false,
        dependencies = {},
        devDependencies = {},
        peerDependencies = {},
        optionalDependencies = {},
        ...rest
      } = require(location)
      if (!name) {
        throw Error('All packages must have a name: ' + location)
      }
      if (!version) {
        throw Error('All packages must have a version: ' + location)
      }
      return {
        name,
        version,
        private: priv,
        location,
        dependencies,
        devDependencies,
        peerDependencies,
        optionalDependencies,
        ...rest,
      }
    })
    .filter(Boolean)
}

export const getAllPackages = (context: string = process.cwd()): Package[] => {
  const pkg: PackageJson = require(join(context, 'package.json'))

  const globs = defaultTo(
    Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces?.packages,
    [],
  )
  const packages = flattenDeep(
    globs.map((glob) => findByGlob(context, glob)),
  ).filter(Boolean)

  const seen = new Map()

  for (const { name, location } of packages) {
    if (seen.has(name)) seen.get(name).push(location)
    else seen.set(name, [location])
  }

  for (const [name, locations] of seen) {
    if (locations.length > 1) {
      throw new Error(
        [
          `Package name "${name}" used in multiple packages:`,
          ...locations,
        ].join('\n\t'),
      )
    }
  }

  return packages
}

export default getAllPackages
