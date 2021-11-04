import { repeat, isUndefined, flattenDeep, pick } from 'lodash'
import { Cycle, Message, Package, Nodes } from './types'

export const padMessage = (message: Message) => {
  switch (message.type) {
    case 'success':
      return `[SUCCESS] ${message.text}`
    case 'warning':
      return `[WARNING] ${message.text}`
    case 'fail':
      return `[FAIL] ${message.text}`
  }
}

interface CircDepsFlags {
  max: number
  'max-total-paths': number
}

export const getCircularDepsMessage = (
  circDeps: Cycle[],
  flags: CircDepsFlags,
): Message => {
  if (circDeps.length === 0) {
    return {
      type: 'success',
      text: 'No circular dependencies found in the project, good job!',
    }
  }

  const isMaxSet = !isUndefined(flags.max)
  const isMaxPathsSet = !isUndefined(flags['max-total-paths'])

  const total = circDeps.length
  const totalPaths = flattenDeep(circDeps).length

  const isUnderMax = Boolean(isMaxSet && total <= flags.max)
  const isUnderMaxPaths = Boolean(
    isMaxPathsSet && totalPaths <= flags['max-total-paths'],
  )

  const getCircDepsMessages = () =>
    circDeps.map(
      (cycle) =>
        '|> ' +
        cycle
          .map(
            (item, index) =>
              repeat(' ', index === 0 ? 0 : index + 3) + item + ' -> \n',
          )
          .join(''),
    )

  return {
    type: isUnderMax && isUnderMaxPaths ? 'warning' : 'fail',
    text: [
      `Found ${total} circular dependencies in the project, please fix these as soon as possible.`,
      [
        '|> Maximum circular dependencies allowed is ',
        flags.max,
        ' "--max", found: ',
        total,
      ].join(''),
      [
        '|> Maximum circular dependencies *paths* allowed is ',
        flags['max-total-paths'],
        ' "--max-total-paths", found: ',
        totalPaths,
      ].join(''),
      '#######################################################################',
      ...getCircDepsMessages(),
    ]
      .filter(Boolean)
      .join('\n\n'),
  }
}

export const printPackages = (
  packages: Package[],
  onlyFlag: string,
  filterFlag: string = '',
): Message => ({
  type: 'success',
  text: JSON.stringify(
    packages
      .filter(({ name }) =>
        filterFlag ? new RegExp(filterFlag).exec(name) !== null : true,
      )
      .map((pkg) => pick(pkg, onlyFlag.split(','))),
    null,
    2,
  ),
})

export const printNodes = (nodes: Nodes) => JSON.stringify(nodes, null, 2)
