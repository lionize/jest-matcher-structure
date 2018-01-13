import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils'
import {
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
  key,
  expected,
  received,
  action = 'be',
) => `Expected value of key "${key}" to ${action}:
  ${printExpected(expected)}
Received:
  ${printReceived(received)}`

export function toMatchStructure(structure, received) {
  const receivedKeys = Object.keys(received).sort()
  const structureKeys = Object.keys(structure).sort()

  if (receivedKeys.length !== structureKeys.length) {
    const msg =
      receivedKeys.length > structureKeys.length
        ? 'Received object has more keys than structure'
        : 'Structure has more keys than received object'
    return {
      message: `${this.utils.matcherHint('.toMatchStructure')}

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

  const processValues = (acc, { key, value = structure[key] }) => {
    if (value === null) {
      if (received[key] !== null) {
        acc.push(formatError(key, value, received[key]))
      }
      return acc
    }

    if (typeof value === 'function') {
      if (!value(received[key])) {
        acc.push(formatError(key, value, received[key], 'pass function test'))
      }
      return acc
    }

    if (isRegex(value)) {
      if (!value.test(received[key])) {
        acc.push(formatError(key, value, received[key], 'match regex'))
      }
      return acc
    }

    if (isType(value)) {
      // eslint-disable-next-line valid-typeof
      if (typeof received[key] !== value) {
        acc.push(formatError(key, value, typeof received[key], 'be of type'))
      }
      return acc
    }

    if (typeof value === 'object') {
      if (isMatcherObject(value)) {
        const matchErrors = value.array
          .map(x => !processValues([], { key, value: x }).length)
          .reduce((acc, cur) => acc.concat(cur), [])

        if (isEvery(value)) {
          if (!matchErrors.every(identity)) {
            acc.push(
              formatError(
                key,
                value.array,
                received[key],
                'match all of the following',
              ),
            )
          }
        }

        if (isSome(value)) {
          if (!matchErrors.some(identity)) {
            acc.push(
              formatError(
                key,
                value.array,
                received[key],
                'match at least one of the following',
              ),
            )
          }
        }
      } else {
        acc.push(
          `Object comparison not currently supported. Check key ${value}.`,
        )
      }
      return acc
    }

    if (Array.isArray(value)) {
      acc.push(`Array comparison not currently supported. Check key ${value}.`)
      return acc
    }

    if (received[key] !== value) {
      acc.push(formatError(key, value, received[key]))
      return acc
    }

    return acc
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
