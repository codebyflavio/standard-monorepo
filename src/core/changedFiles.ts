import execa from 'execa'
import { join } from 'path'

const getChangedFiles = async (since: string): Promise<string[]> => {
  const { stdout: fullPath } = await execa.command(
    'git rev-parse --show-toplevel',
  )
  const { stdout: changedFiles } = await execa.command(
    'git diff --name-only ' + since,
  )
  return changedFiles.split('\n').map((filePath) => join(fullPath, filePath))
}

export default getChangedFiles
