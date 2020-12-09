# standard-monorepo

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/standard-monorepo.svg)](https://npmjs.org/package/standard-monorepo)
[![Downloads/week](https://img.shields.io/npm/dw/standard-monorepo.svg)](https://npmjs.org/package/standard-monorepo)
[![License](https://img.shields.io/npm/l/standard-monorepo.svg)](https://github.com/imflavio/standard-monorepo/blob/master/package.json)

<!-- toc -->
* [standard-monorepo](#standard-monorepo)
* [Goal](#goal)
* [Roadmap v1](#roadmap-v1)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Goal

The goal is to create a library that will help you and your team manage js monorepos. We assume that you run github flow with rebase enabled and provide everything available in the CLI programatically.

standard-monorepo should be all you need to run a js monorepo effectively, no need to setup commitlint, fiddle with lerna and optimise CI environments.

# Roadmap v1

- [x] [Conventional commits](https://www.conventionalcommits.org/)
      Also supports a "--scope" flag and validates against a JIRA ticket number
  - [x] Lint (Similar to [commitlint](https://github.com/conventional-changelog/commitlint), without the configuration)
    ```sh-session
    $ standard-monorepo commit "feat: did things"
    > [SUCCESS] Commit message meets the conventional commit standard
    ```
    ```sh-session
    $ standard-monorepo commit "did things"
    ›   Error: [FAIL]
    ›
    ›   ####################################
    ›   did things
    ›   ####################################
    ›
    ›
    ›   Make sure you follow the conventional commit format and provide the correct scope flag for your needs.
    ```
  - [x] Prompt (Similar to [commitizen](https://github.com/commitizen/cz-cli), without the configuration)
- [x] Detect packages (yarn workspaces glob)
- [x] Circular Dependencies

  - [x] Find circular dependencies
  - [x] "--max" and "--maxTotalPaths" flags to prevent addicional circular dependencies or paths being introduced (if below they will output warnings instead of a failure)

  ```sh-session
  $ standard-monorepo circular-deps --max=1 --maxTotalPaths=55

  Found 2 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 1 "--max", found: 2

      |> Maximum circular dependencies *paths* allowed is 55 "--maxTotalPaths", found: 5

      #######################################################################

      |> foo ->
          bar ->


      |> a ->
          b ->
           c ->
  ```

- [x] Print what packages have changed since a git ref. See [`standard-monorepo list`](#standard-monorepo-list)
- [ ] CI helpers (github actions / gitlab ci / circle ci / etc) so that we only build/test what has changed
- [ ] Run command (Similar to `lerna exec "echo hello" --stream` and `lerna exec "echo hello" --parallel`)
- [ ] Watch command (Something that doesn't exist in the ecosystem at the moment)
- [ ] Publish (Similar to `lerna publish --conventional-commits`)

# Usage

<!-- usage -->
```sh-session
$ npm install -g standard-monorepo
$ standard-monorepo COMMAND
running command...
$ standard-monorepo (-v|--version|version)
standard-monorepo/0.4.1 darwin-x64 node-v14.15.1
$ standard-monorepo --help [COMMAND]
USAGE
  $ standard-monorepo COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`standard-monorepo circular-deps`](#standard-monorepo-circular-deps)
* [`standard-monorepo commit [COMMIT]`](#standard-monorepo-commit-commit)
* [`standard-monorepo help [COMMAND]`](#standard-monorepo-help-command)
* [`standard-monorepo list`](#standard-monorepo-list)

## `standard-monorepo circular-deps`

```
USAGE
  $ standard-monorepo circular-deps

OPTIONS
  -h, --help                     show CLI help
  --max=max                      maximum allowed individual circular dependencies
  --maxTotalPaths=maxTotalPaths  maximum allowed circular dependencies paths

EXAMPLES
  $ standard-monorepo circular-deps
  $ standard-monorepo circular-deps --max=5 --maxTotalPaths=10 # default is 0 for both
```

_See code: [src/commands/circular-deps.ts](https://github.com/imflavio/standard-monorepo/blob/v0.4.1/src/commands/circular-deps.ts)_

## `standard-monorepo commit [COMMIT]`

```
USAGE
  $ standard-monorepo commit [COMMIT]

ARGUMENTS
  COMMIT  The commit message

OPTIONS
  -h, --help   show CLI help
  -s, --scope  should include scope in the commit message

EXAMPLES
  $ standard-monorepo commit # this will create a prompt like commitizen
  $ standard-monorepo commit --scope # this will create a prompt like commitizen
  $ standard-monorepo commit "feat: did things"
  $ standard-monorepo commit "feat!: did things"
  $ standard-monorepo commit "feat(ABC-123): did things" --scope
  $ standard-monorepo commit "feat!(ABC-123): did things" --scope
  "husky": {
     "hooks": {
       "commit-msg": "standard-monorepo commit $HUSKY_GIT_PARAMS"
     }
  }
```

_See code: [src/commands/commit.ts](https://github.com/imflavio/standard-monorepo/blob/v0.4.1/src/commands/commit.ts)_

## `standard-monorepo help [COMMAND]`

```
USAGE
  $ standard-monorepo help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.0/src/commands/help.ts)_

## `standard-monorepo list`

```
USAGE
  $ standard-monorepo list

OPTIONS
  -h, --help     show CLI help
  --forkPoint    list all packages that have changed since a fork point, using "git merge-base --fork-point $YOUR_REF"
  --nodes        list a representation of the dependency graph
  --only=only    [default: name,version,private,location] fields to return for each package
  --since=since  list all packages that have changed since a git ref

EXAMPLES
  $ standard-monorepo list
  $ standard-monorepo list >> list.json
  $ standard-monorepo list --only="name,version"
  [
     {
       "name": "a",
       "version": "1.0.0"
     },
     {
       "name": "b",
       "version": "1.0.0"
     },
     {
       "name": "c",
       "version": "1.0.0"
     }
  ]
  $ standard-monorepo list 
  --only="name,version,private,location,dependencies,devDependencies,peerDependencies,optionalDependencies"
  $ standard-monorepo list --nodes # Shows all packages and their dependencies in an indexed table
  $ standard-monorepo list --since=gitsha --only=name,version
  $ standard-monorepo list --since=$(git merge-base --fork-point main)
  $ standard-monorepo list --since=main --forkPoint # same as above
  $ standard-monorepo list --since=main # same as above as --forkPoint default is true
```

_See code: [src/commands/list.ts](https://github.com/imflavio/standard-monorepo/blob/v0.4.1/src/commands/list.ts)_
<!-- commandsstop -->
