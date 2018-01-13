import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils'
import {
  is,
  isSome,
  isEvery,
  isRegex,
  isType,
  identity,
  isMatcherObject,
} from './utils'

export const some = array => ({ __matcher: 'some', array })
export const every = array => ({ __matcher: 'every', array })

export const formatError = (
  expected,
  received,
  action = 'be',
) => key => `Expected value of key "${key}" to ${action}:
  ${printExpected(expected)}
Received:
  ${printReceived(received)}`

const testKeys = (structureKeys, receivedKeys) => {
  if (receivedKeys.length !== structureKeys.length) {
    return receivedKeys.length > structureKeys.length
      ? 'Received object has more keys than structure'
      : 'Structure has more keys than received object'
  }
}

const testNull = (structureValue, receivedValue) =>
  !is(structureValue) &&
  is(receivedValue) &&
  formatError(structureValue, receivedValue)

const testFunction = (structureValue, receivedValue) =>
  typeof structureValue === 'function' &&
  !structureValue(receivedValue) &&
  formatError(structureValue, receivedValue, 'pass function test')

const testRegex = (structureValue, receivedValue) =>
  isRegex(structureValue) &&
  !structureValue.test(receivedValue) &&
  formatError(structureValue, receivedValue, 'match regex')

const testType = (structureValue, receivedValue) =>
  isType(structureValue) &&
  typeof receivedValue !== structureValue &&
  formatError(structureValue, typeof receivedValue, 'be of type')

const testArray = (structureValue, receivedValue, key) =>
  Array.isArray(structureValue) &&
  `Array comparison not currently supported. Check key ${key}.`

const testLiteral = (structureValue, receivedValue) =>
  structureValue !== receivedValue && formatError(structureValue, receivedValue)

export function toMatchStructure(structure, received) {
  const processValues = (acc, { key, value = structure[key] }) => {
    const receivedValue = received[key]
    let error

    if (value === null) {
      if ((error = testNull(value, receivedValue))) {
        acc.push(error(key))
      }
      return acc
    }

    if (typeof value === 'function') {
      if ((error = testFunction(value, receivedValue))) {
        acc.push(error(key))
      }
      return acc
    }

    if (isRegex(value)) {
      if ((error = testRegex(value, receivedValue))) {
        acc.push(error(key))
      }
      return acc
    }

    if (isType(value)) {
      if ((error = testType(value, receivedValue))) {
        acc.push(error(key))
      }
      return acc
    }

    if (Array.isArray(value)) {
      if ((error = testArray(value, receivedValue, key))) {
        acc.push(typeof error === 'function' ? error(key) : error)
      }
      return acc
    }

    const testObject = (structureValue, receivedValue, key) => {
      if (typeof structureValue === 'object') {
        if (isMatcherObject(structureValue)) {
          const matchErrors = structureValue.array
            .map(x => !processValues([], { key, value: x }).length)
            .reduce((acc, cur) => acc.concat(cur), [])

          let msg

          if (isEvery(structureValue)) {
            if (!matchErrors.every(identity)) {
              msg = 'match all of the following'
            }
          }

          if (isSome(structureValue)) {
            if (!matchErrors.some(identity)) {
              msg = 'match at least one of the following'
            }
          }

          if (msg) {
            return formatError(structureValue.array, receivedValue, msg)
          }
        } else {
          return `Object comparison not currently supported. Check key ${key}.`
        }
      }
    }

    if (typeof value === 'object') {
      if ((error = testObject(value, receivedValue, key))) {
        acc.push(typeof error === 'function' ? error(key) : error)
      }
      return acc
    }

    if (receivedValue !== value) {
      if ((error = testLiteral(value, receivedValue))) {
        acc.push(error(key))
      }
      return acc
    }

    return acc
  }

  let msg

  const structureKeys = Object.keys(structure).sort()
  const receivedKeys = Object.keys(received).sort()

  if ((msg = testKeys(structureKeys, receivedKeys))) {
    return {
      message: () => `${matcherHint('.toMatchStructure')}

      ${msg}.

      Expected:
        ${structureKeys}
      Received:
        ${receivedKeys}`,
      pass: false,
    }
  }

  let errors = []

  for (let i = 0; i < structureKeys.length; i++) {
    if (receivedKeys[i] !== structureKeys[i]) {
      errors.push(
        `Key mismatch:\n\tStructure: ${structureKeys[i]} | Actual: ${
          receivedKeys[i]
        }`,
      )
    }
  }

  if (errors.length) {
    return {
      message: `Structure does not match:\n${errors.join('\n')}`,
      pass: false,
    }
  }

  errors = Object.keys(structure).reduce((acc, key) => {
    return processValues(acc, { key })
  }, [])

  return errors.length
    ? {
        message: () =>
          `${matcherHint('.toMatchStructure')}\n\n${errors.join('\n')}`,
        pass: false,
      }
    : { pass: true }
}
