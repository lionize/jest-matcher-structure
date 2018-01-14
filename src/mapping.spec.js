import { some, every } from './helpers'
import {
  mapStructureValueToTestType,
  testKeys,
  testNull,
  testFunction,
  testRegex,
  testType,
  testArray,
  testMatcherObject,
  testObject,
  testLiteral,
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
    [some([]), 'matcherObject'],
    [every([]), 'matcherObject'],
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

test('testArray', () => {
  expect(typeof testArray(['a']).message).toEqual('function')
})

test('testMatcherObject', () => {
  expect(testMatcherObject(some(['a'], 'b'))).toEqual({
    action: 'match at least one of the following',
    structure: ['a'],
  })
  expect(testMatcherObject(some(['a']), 'a')).toBeFalsy()

  expect(testMatcherObject(every(['a']), 'b')).toEqual({
    action: 'match all of the following',
    structure: ['a'],
  })
  expect(testMatcherObject(every(['a']), 'a')).toBeFalsy()
})

test('testObject', () => {
  expect(typeof testObject({}).message).toEqual('function')
})

test('testLiteral', () => {
  expect(testLiteral('a', 'b')).toEqual(true)
  expect(testLiteral('a', 'a')).toBe(false)
})
