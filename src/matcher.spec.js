import prettyFormat from 'pretty-format'
import stripmargin from 'stripmargin'
import { formatError, toMatchStructure } from './matcher'
import { some, every, repeat } from './helpers'

stripmargin.inject()

jest.mock('jest-matcher-utils', () => ({
  printExpected: x => x,
  printReceived: x => x,
  matcherHint: x => x,
  stringify: x => x,
}))

expect.extend({ toMatchStructure })

describe('toMatchStructure', () => {
  test('returns object with pass as true on success', () => {
    const obj = { field: 'hello' }
    const structure = { field: 'hello' }
    const actual = toMatchStructure(structure, obj)

    expect(actual).toEqual({ pass: true })
  })

  test('returns object with pass as false and a message function on failure', () => {
    const obj = { field: 'hello' }
    const structure = { field: 'number' }
    const actual = toMatchStructure(structure, obj)

    expect(actual.pass).toBe(false)
    expect(typeof actual.message).toBe('function')
  })

  describe('Error messages', () => {
    test('null mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: null }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(null, 'hello')('field')

      expect(message).toContain(actual)
    })

    test('literal mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 456 }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(456, 123)('field')

      expect(message).toContain(actual)
    })

    test('string mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 'string' }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError('string', 'number', 'be of type')('field')

      expect(message).toContain(actual)
    })

    test('boolean mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 'boolean' }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError('boolean', 'number', 'be of type')('field')

      expect(message).toContain(actual)
    })

    test('number mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: 'number' }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError('number', 'string', 'be of type')('field')

      expect(message).toContain(actual)
    })

    test('regex mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: /\d+/ }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(/\d+/, 'hello', 'match regex')('field')

      expect(message).toContain(actual)
    })

    test('function mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: x => x.length > 5 }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(
        structure.field,
        'hello',
        'pass function test'.trim(),
      )('field')

      expect(message).toContain(actual)
    })

    test('some in array mismatch', () => {
      const arr = ['A', 'B']
      const obj = { field: 'hello' }
      const structure = { field: some(arr) }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(
        arr,
        'hello',
        'match at least one of the following',
      )('field')

      expect(message).toContain(actual)
    })

    test('every in array mismatch', () => {
      const arr = ['hi', x => x.length > 10]
      const obj = { field: 'hello' }
      const structure = { field: every(arr) }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(arr, 'hello', 'match all of the following')(
        'field',
      )

      expect(message).toContain(actual)
    })

    test('object comparison', () => {
      const obj = {
        field1: { field2: { field3: 'hello', field4: true }, field5: 1 },
      }
      const structure = {
        field1: {
          field2: { field3: 'number', field4: 'string' },
          field5: 'boolean',
        },
      }
      const message = toMatchStructure(structure, obj).message()
      const field3Actual = formatError('number', 'string', 'be of type')(
        'field1.field2.field3',
      )
      const field4Actual = formatError('string', 'boolean', 'be of type')(
        'field1.field2.field4',
      )
      const field5Actual = formatError('boolean', 'number', 'be of type')(
        'field1.field5',
      )

      expect(message).toContain(field3Actual)
      expect(message).toContain(field4Actual)
      expect(message).toContain(field5Actual)
    })

    test('array comparison', () => {
      const obj = { field1: ['hi', 'hello'] }
      const structure = { field1: [repeat('number')] }
      const message = toMatchStructure(structure, obj).message()
      const actual = formatError(
        [repeat('number')],
        ['hi', 'hello'],
        'match array structure',
      )('field1')

      expect(message).toContain(actual)
    })

    test('differing number of keys', () => {
      const obj = { field1: 'hello', field2: 'hi', field3: 'what?' }
      const structure = { field1: 'string', field2: 'string' }
      let message = toMatchStructure(structure, obj).message()
      let actual = 'Received object has more keys than structure'

      expect(message).toContain(actual)

      message = toMatchStructure(obj, structure).message()
      actual = 'Structure has more keys than received object'

      expect(message).toContain(actual)
    })
  })
})

describe('formatError', () => {
  test('prints in the expected format', () => {
    const key = 'key'
    const expected = 'expected'
    const received = 'received'
    const message = `Expected value of key "${key}" to be:
    |  expected
    |Received:
    |  received`.stripMargin()

    expect(formatError(expected, received)(key)).toEqual(message)
  })
})

describe('expect.extend toMatchStructure', () => {
  test('matches literal values', () => {
    const actual = {
      string: 'hello',
      boolean: true,
      number: 1,
    }
    const structure = {
      string: 'hello',
      boolean: true,
      number: 1,
    }

    expect(structure).toMatchStructure(actual)
  })

  test('matches string', () => {
    const actual = { field: 'hello' }
    const structure = { field: 'string' }

    expect(structure).toMatchStructure(actual)
  })

  test('matches boolean', () => {
    const actual = { field: true }
    const structure = { field: 'boolean' }

    expect(structure).toMatchStructure(actual)
  })

  test('matches number', () => {
    const actual = { field: 1 }
    const structure = { field: 'number' }

    expect(structure).toMatchStructure(actual)
  })

  test('matches regex', () => {
    const actual = { field: '111' }
    const structure = { field: /\d{3}/ }

    expect(structure).toMatchStructure(actual)
  })

  test('matches function', () => {
    const actual = { field: 1 }
    const structure = { field: n => n > 0 }

    expect(structure).toMatchStructure(actual)
  })

  test('matches some values in array', () => {
    const actual = { field: 'ABC' }
    const structure = { field: some(['ABC', 'DEF', 'GHI']) }

    expect(structure).toMatchStructure(actual)
  })

  test('matches every value in array', () => {
    const actual = { field: 'ABC' }
    const structure = { field: every(['string', x => x.length > 0]) }

    expect(structure).toMatchStructure(actual)
  })
})
