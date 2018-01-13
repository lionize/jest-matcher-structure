import prettyFormat from 'pretty-format'
import stripmargin from 'stripmargin'
import { some, every, formatError, toMatchStructure } from './matcher'

stripmargin.inject()

jest.mock('jest-matcher-utils', () => ({
  printExpected: x => x,
  printReceived: x => x,
  matcherHint: x => x,
  stringify: x => x,
}))

expect.extend({ toMatchStructure })

test('some', () => {
  const array = [1, 2, 3]
  const expected = { __matcher: 'some', array }

  expect(some(array)).toEqual(expected)
})

test('every', () => {
  const array = [1, 2, 3]
  const expected = { __matcher: 'every', array }

  expect(every(array)).toEqual(expected)
})

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
    test('literal mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 456 }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError('field', 456, 123)

      expect(message).toContain(actual)
    })

    test('string mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 'string' }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError('field', 'string', 'number', 'be of type')

      expect(message).toContain(actual)
    })

    test('boolean mismatch', () => {
      const obj = { field: 123 }
      const structure = { field: 'boolean' }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError('field', 'boolean', 'number', 'be of type')

      expect(message).toContain(actual)
    })

    test('number mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: 'number' }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError('field', 'number', 'string', 'be of type')

      expect(message).toContain(actual)
    })

    test('regex mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: /\d+/ }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError('field', /\d+/, 'hello', 'match regex')

      expect(message).toContain(actual)
    })

    test('function mismatch', () => {
      const obj = { field: 'hello' }
      const structure = { field: x => x.length > 5 }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError(
        'field',
        structure.field,
        'hello',
        'pass function test'.trim(),
      )

      expect(message).toContain(actual)
    })

    test('some in array mismatch', () => {
      const arr = ['A', 'B']
      const obj = { field: 'hello' }
      const structure = { field: some(arr) }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError(
        'field',
        arr,
        'hello',
        'match at least one of the following',
      )

      expect(message).toContain(actual)
    })

    test('every in array mismatch', () => {
      const arr = ['hi', x => x.length > 10]
      const obj = { field: 'hello' }
      const structure = { field: every(arr) }
      const message = toMatchStructure(structure, obj)
        .message()
        .trim()
      const actual = formatError(
        'field',
        arr,
        'hello',
        'match all of the following',
      )

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

    expect(formatError(key, expected, received)).toEqual(message)
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
