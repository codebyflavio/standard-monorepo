import { padMessage, getCircularDepsMessage, printPackages } from '../message'
import { Package } from '../types'

describe('[padMessage]', () => {
  it('should pad with success', () => {
    expect(padMessage({ type: 'success', text: 'foo' })).toMatchInlineSnapshot(
      `"[SUCCESS] foo"`,
    )
  })
  it('should pad with warning', () => {
    expect(padMessage({ type: 'warning', text: 'foo' })).toMatchInlineSnapshot(
      `"[WARNING] foo"`,
    )
  })
  it('should pad with fail', () => {
    expect(padMessage({ type: 'fail', text: 'foo' })).toMatchInlineSnapshot(
      `"[FAIL] foo"`,
    )
  })
})

describe('[getCircularDepsMessage]', () => {
  it('should provide a success message if no circular dependencies are found', () => {
    const circDeps = []
    const flags = {
      max: 0,
      'max-total-paths': 0,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "No circular dependencies found in the project, good job!",
        "type": "success",
      }
    `)
  })

  it('should provide a fail message if no flag is set', () => {
    const circDeps = [['foo', 'bar']]
    const flags = {
      max: 0,
      'max-total-paths': 0,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "Found 1 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 0 \\"--max\\", found: 1

      |> Maximum circular dependencies *paths* allowed is 0 \\"--max-total-paths\\", found: 2

      #######################################################################

      |> foo -> 
          bar -> 
      ",
        "type": "fail",
      }
    `)
  })

  it('should provide a waning message if below the max flag', () => {
    const circDeps = [['foo', 'bar']]
    const flags = {
      max: 1,
      'max-total-paths': 55,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "Found 1 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 1 \\"--max\\", found: 1

      |> Maximum circular dependencies *paths* allowed is 55 \\"--max-total-paths\\", found: 2

      #######################################################################

      |> foo -> 
          bar -> 
      ",
        "type": "warning",
      }
    `)
  })

  it('should provide a fail message if above the max flag', () => {
    const circDeps = [
      ['foo', 'bar'],
      ['a', 'b', 'c'],
    ]
    const flags = {
      max: 1,
      'max-total-paths': 55,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "Found 2 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 1 \\"--max\\", found: 2

      |> Maximum circular dependencies *paths* allowed is 55 \\"--max-total-paths\\", found: 5

      #######################################################################

      |> foo -> 
          bar -> 


      |> a -> 
          b -> 
           c -> 
      ",
        "type": "fail",
      }
    `)
  })

  it('should provide a waning message if below maxTotalPaths flag', () => {
    const circDeps = [['foo', 'bar', 'baz', 'a', 'b']]
    const flags = {
      max: 1,
      'max-total-paths': 5,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "Found 1 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 1 \\"--max\\", found: 1

      |> Maximum circular dependencies *paths* allowed is 5 \\"--max-total-paths\\", found: 5

      #######################################################################

      |> foo -> 
          bar -> 
           baz -> 
            a -> 
             b -> 
      ",
        "type": "warning",
      }
    `)
  })

  it('should provide a fail message if above maxTotalPaths flag', () => {
    const circDeps = [['foo', 'bar', 'baz', 'a', 'b', 'c']]
    const flags = {
      max: 1,
      'max-total-paths': 5,
    }
    expect(getCircularDepsMessage(circDeps, flags)).toMatchInlineSnapshot(`
      Object {
        "text": "Found 1 circular dependencies in the project, please fix these as soon as possible.

      |> Maximum circular dependencies allowed is 1 \\"--max\\", found: 1

      |> Maximum circular dependencies *paths* allowed is 5 \\"--max-total-paths\\", found: 6

      #######################################################################

      |> foo -> 
          bar -> 
           baz -> 
            a -> 
             b -> 
              c -> 
      ",
        "type": "fail",
      }
    `)
  })
})

describe('[printPackages]', () => {
  const packages: Package[] = [
    {
      name: '@foo/a',
      version: '0.0.0',
      location: 'foo/a',
    },
    {
      name: '@foo/b',
      version: '0.0.0',
      location: 'foo/b',
    },
    {
      name: '@bar/a',
      version: '0.0.0',
      location: 'bar/a',
    },
  ] as Package[]

  it('only name', () => {
    expect(printPackages(packages, 'name', '')).toMatchInlineSnapshot(`
      Object {
        "text": "[
        {
          \\"name\\": \\"@foo/a\\"
        },
        {
          \\"name\\": \\"@foo/b\\"
        },
        {
          \\"name\\": \\"@bar/a\\"
        }
      ]",
        "type": "success",
      }
    `)
  })

  test('name and location', () => {
    expect(printPackages(packages, 'name,location', '')).toMatchInlineSnapshot(`
      Object {
        "text": "[
        {
          \\"name\\": \\"@foo/a\\",
          \\"location\\": \\"foo/a\\"
        },
        {
          \\"name\\": \\"@foo/b\\",
          \\"location\\": \\"foo/b\\"
        },
        {
          \\"name\\": \\"@bar/a\\",
          \\"location\\": \\"bar/a\\"
        }
      ]",
        "type": "success",
      }
    `)
  })

  test('search scope', () => {
    expect(printPackages(packages, 'name', '@foo')).toMatchInlineSnapshot(`
      Object {
        "text": "[
        {
          \\"name\\": \\"@foo/a\\"
        },
        {
          \\"name\\": \\"@foo/b\\"
        }
      ]",
        "type": "success",
      }
    `)
  })

  test('search name', () => {
    expect(printPackages(packages, 'name', '/a')).toMatchInlineSnapshot(`
      Object {
        "text": "[
        {
          \\"name\\": \\"@foo/a\\"
        },
        {
          \\"name\\": \\"@bar/a\\"
        }
      ]",
        "type": "success",
      }
    `)
  })
})
