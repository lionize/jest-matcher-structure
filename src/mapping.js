import {
  is,
  isSome,
  isEvery,
  isRepeat,
  isRegex,
  isType,
  identity,
  isMatcherObject,
  joinKeys,
} from './utils'

export const mapStructureValueToTestType = value => {
  if (!is(value)) return 'null'
  if (typeof value === 'function') return 'function'
  if (isRegex(value)) return 'regex'
  if (isType(value)) return 'type'
  if (Array.isArray(value)) return 'array'
  if (isMatcherObject(value)) {
    return isSome(value)
      ? 'someMatcher'
      : isEvery(value)
        ? 'everyMatcher'
        : isRepeat(value) ? 'repeatMatcher' : null
  }
  if (typeof value === 'object') {
    return 'object'
  }
  return 'literal'
}

export const mapValuesToError = (structure, received, key) => {
  const type = mapStructureValueToTestType(structure)
  const fn = tests[type]

  return fn(structure, received, key)
}

export const mapErrors = (structure, received, outerKey) => {
  return Object.keys(structure).reduce((acc, key) => {
    let error = mapValuesToError(
      structure[key],
      received[key],
      joinKeys(outerKey, key),
    )

    if (!error) return acc

    if (Array.isArray(error)) {
      return acc.concat(error)
    }

    if (error === true) {
      acc.push({
        structure: structure[key],
        received: received[key],
        key: key,
      })
    }

    if (typeof error === 'string') {
      acc.push(error)
    }

    if (typeof error === 'object') {
      error.structure = error.structure || structure[key]
      error.received = error.received || received[key]
      error.key = joinKeys(outerKey, key)
      acc.push(error)
    }

    return acc
  }, [])
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

export const testArray = (structureValue, receivedValue) => {
  const successes = structureValue.reduce((acc, structure) => {
    if (isRepeat(structure)) {
      return (
        acc +
        receivedValue.reduce((acc, received) => {
          !mapValuesToError(structure, received) && acc++
          return acc
        }, 0)
      )
    } else {
      receivedValue.find(received => !mapValuesToError(structure, received)) &&
        acc++
      return acc
    }
    return acc
  }, 0)

  if (successes !== receivedValue.length) {
    return { action: 'match array structure' }
  }
}

export const testRepeatMatcher = ({ structure }, receivedValue) =>
  mapValuesToError(structure, receivedValue)

export const testEveryMatcher = ({ array }, receivedValue) =>
  array.reduce(
    (acc, cur) => acc && mapValuesToError(cur, receivedValue),
    true,
  ) && {
    action: 'match all of the following',
    structure: array,
  }

export const testSomeMatcher = ({ array }, receivedValue) =>
  !array.find(s => !mapValuesToError(s, receivedValue)) && {
    action: 'match at least one of the following',
    structure: array,
  }

export const testLiteral = (structureValue, receivedValue) =>
  structureValue !== receivedValue

const tests = {
  null: testNull,
  function: testFunction,
  regex: testRegex,
  type: testType,
  array: testArray,
  repeatMatcher: testRepeatMatcher,
  everyMatcher: testEveryMatcher,
  someMatcher: testSomeMatcher,
  object: mapErrors,
  literal: testLiteral,
}
