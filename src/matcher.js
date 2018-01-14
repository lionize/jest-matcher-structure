import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils'
import {
  testKeys,
  mapStructureValueToTestType,
  mapValuesToError,
} from './mapping'
import { some, every } from './helpers'

export const formatError = (
  expected,
  received,
  action = 'be',
) => key => `Expected value of key "${key}" to ${action}:
  ${printExpected(expected)}
Received:
  ${printReceived(received)}`

export function toMatchStructure(structure, received) {
  const keysError = testKeys(structure, received)

  if (keysError) {
    return fail([
      `${keysError.message}\n` +
        `Expected:\n\t${keysError.structure}\n` +
        `Received:\n\t:${keysError.received}`,
    ])
  }

  const mapErrors = Object.keys(structure).reduce((acc, key) => {
    let error = mapValuesToError(structure[key], received[key])

    if (error) {
      if (error.message) {
        acc.push(error.message(key))
      } else {
        acc.push(
          formatError(
            error.structure || structure[key],
            error.received || received[key],
            error.action,
          )(key),
        )
      }
    }

    return acc
  }, [])

  return mapErrors.length ? fail(mapErrors) : pass()
}

const fail = errors => ({
  message: () => `${matcherHint('.toMatchStructure')}\n\n${errors.join('\n')}`,
  pass: false,
})

const pass = () => ({
  pass: true,
})
