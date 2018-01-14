import {
  is,
  isSome,
  isEvery,
  isRegex,
  isType,
  identity,
  isMatcherObject,
} from './utils'

export const mapStructureValueToTestType = value => {
  if (!is(value)) return 'null'
  if (typeof value === 'function') return 'function'
  if (isRegex(value)) return 'regex'
  if (isType(value)) return 'type'
  if (Array.isArray(value)) return 'array'
  if (typeof value === 'object')
    return isMatcherObject(value) ? 'matcherObject' : 'object'
  return 'literal'
}

export const mapValuesToError = (structure, received) => {
  const type = mapStructureValueToTestType(structure)
  const fn = tests[type]

  return fn(structure, received)
}

export const testKeys = (structure, received) => {
  const structureKeys = Object.keys(structure)
  const receivedKeys = Object.keys(received)

  if (receivedKeys.length !== structureKeys.length) {
    let message =
      receivedKeys.length > structureKeys.length
        ? 'Received object has more keys than structure'
        : 'Structure has more keys than received object'
    return {
      message,
      structure: structureKeys,
      received: receivedKeys,
    }
  }
}

export const testNull = (structureValue, receivedValue) => is(receivedValue)

export const testFunction = (structureValue, receivedValue) =>
  typeof structureValue === 'function' &&
  !structureValue(receivedValue) && { action: 'pass function test' }

export const testRegex = (structureValue, receivedValue) =>
  isRegex(structureValue) &&
  !structureValue.test(receivedValue) && { action: 'match regex' }

export const testType = (structureValue, receivedValue) =>
  isType(structureValue) &&
  typeof receivedValue !== structureValue && {
    received: typeof receivedValue,
    action: 'be of type',
  }

export const testArray = (structureValue, receivedValue, key) =>
  Array.isArray(structureValue) && {
    message: key =>
      `Array comparison not currently supported. Check key ${key}.`,
  }

export const testMatcherObject = (structureValue, receivedValue) => {
  const errorsCount = structureValue.array.reduce(
    (acc, cur) => (mapValuesToError(cur, receivedValue) && acc++, acc),
    0,
  )

  let action

  if (isEvery(structureValue) && errorsCount) {
    action = 'match all of the following'
  }

  if (isSome(structureValue) && errorsCount === structureValue.array.length) {
    action = 'match at least one of the following'
  }

  return action && { action, structure: structureValue.array }
}

export const testObject = (structureValue, receivedValue, key) => ({
  message: key =>
    `Object comparison not currently supported. Check key ${key}.`,
})

export const testLiteral = (structureValue, receivedValue) =>
  structureValue !== receivedValue

const tests = {
  null: testNull,
  function: testFunction,
  regex: testRegex,
  type: testType,
  array: testArray,
  matcherObject: testMatcherObject,
  object: testObject,
  literal: testLiteral,
}
