import { some, every, repeat } from './helpers'
import {
  mapStructureValueToTestType,
  testKeys,
  testNull,
  testFunction,
  testRegex,
  testType,
  testArray,
  testLiteral,
  testEveryMatcher,
  testSomeMatcher,
  testRepeatMatcher,
  mapValuesToError,
} from './mapping'
let _

test('mapStructureValueToTestType maps values to types', () => {
  ;[
    [null, 'null'],
    [x => x, 'function'],
    [/\d/, 'regex'],
    ['string', 'type'],
    ['boolean', 'type'],
    ['number', 'type'],
    [{}, 'object'],
    [repeat('string'), 'repeatMatcher'],
    [some([]), 'someMatcher'],
    [every([]), 'everyMatcher'],
    ['hello', 'literal'],
  ].forEach(([actual, expected]) =>
    expect(mapStructureValueToTestType(actual)).toEqual(expected),
  )
})

test('mapValuesToError returns error object from test function', () => {
  const structure = 'string'
  const received = 1

  expect(mapValuesToError(structure, received)).toEqual({
    received: 'number',
    action: 'be of type',
  })
})

test('testKeys returns correct error message', () => {
  let structure = {
    1: 'a',
  }
  let structureKeys = ['1']
  let received = []
  let receivedKeys = []

  expect(testKeys(structure, received)).toEqual({
    message: 'Structure has more keys than received object',
    structure: structureKeys,
    received: receivedKeys,
  })

  structure = {}
  structureKeys = []
  received = { 1: 'a' }
  receivedKeys = ['1']

  expect(testKeys(structure, received)).toEqual({
    message: 'Received object has more keys than structure',
    structure: structureKeys,
    received: receivedKeys,
  })
})

test('testNull', () => {
  expect(testNull(_, null)).toBe(false)
  expect(testNull(_, undefined)).toBe(false)
  expect(testNull(_, false)).toBe(true)
  expect(testNull(_, 'hello')).toBe(true)
})

test('testFunction', () => {
  expect(testFunction(x => x > 1, 1)).toEqual({ action: 'pass function test' })
  expect(testFunction(x => x, 1)).toBe(false)
})

test('testRegex', () => {
  expect(testRegex(/\d/, 'a')).toEqual({ action: 'match regex' })
  expect(testRegex(/\d/, '1')).toBe(false)
})

test('testType', () => {
  expect(testType('string', 1)).toEqual({
    received: 'number',
    action: 'be of type',
  })
  expect(testType('string', 'string')).toBe(false)

  expect(testType('number', true)).toEqual({
    received: 'boolean',
    action: 'be of type',
  })
  expect(testType('number', 1)).toBe(false)

  expect(testType('boolean', 'a')).toEqual({
    received: 'string',
    action: 'be of type',
  })
  expect(testType('boolean', true)).toBe(false)
})

describe('testArray', () => {
  const action = 'match array structure'

  test('literal structure', () => {
    const structure = ['hello', 1, 'world']
    let received = [0, 'world', 'hello']
    expect(testArray(structure, received)).toEqual({
      action,
    })

    received = [1, 'hello', 'world']
    expect(testArray(structure, received)).toBeFalsy()
  })

  test('repeat structure', () => {
    const structure = [repeat('string')]
    let received = ['hello', 1, 'world']
    expect(testArray(structure, received)).toEqual({
      action,
    })

    received = ['hello', 'world', 'foobar']
    expect(testArray(structure, received)).toBeFalsy()
  })

  test('mixed structure', () => {
    let structure = [repeat('string'), 1, 'boolean']
    let received = ['hello', 'world', 1, true, 'foobar', false]
    expect(testArray(structure, received)).toBeTruthy()

    received = ['hello', 'world', 1, true, 'foobar']
    expect(testArray(structure, received)).toBeFalsy()

    structure = [repeat('string'), repeat(every(['number', x => x > 0]))]
    received = ['hello', 0, 1, '1', 'world']
    expect(testArray(structure, received)).toBeTruthy()

    received = ['hello', 'world', 1, 2]
    expect(testArray(structure, received)).toBeFalsy()
  })
})

test('testSomeMatcher', () => {
  const structure = some(['a'])

  let received = 'b'
  expect(testSomeMatcher(structure, received)).toEqual({
    action: 'match at least one of the following',
    structure: ['a'],
  })

  received = 'a'
  expect(testSomeMatcher(structure, received)).toBeFalsy()
})

test('testEveryMatcher', () => {
  const structure = every(['a'])

  let received = 'b'
  expect(testEveryMatcher(structure, received)).toEqual({
    action: 'match all of the following',
    structure: ['a'],
  })

  received = 'a'
  expect(testEveryMatcher(structure, received)).toBeFalsy()
})

test('testRepeatMatcher', () => {
  const structure = repeat('a')

  let received = 'b'
  expect(testRepeatMatcher(structure, received)).toBe(true)

  received = 'a'
  expect(testRepeatMatcher(structure, received)).toBeFalsy()
})

test('testLiteral', () => {
  expect(testLiteral('a', 'b')).toEqual(true)
  expect(testLiteral('a', 'a')).toBe(false)
})
