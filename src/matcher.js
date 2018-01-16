import { printExpected, printReceived, matcherHint } from 'jest-matcher-utils'
import { testKeys, mapStructureValueToTestType, mapErrors } from './mapping'

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

  const errors = mapErrors(structure, received).map(error => {
    if (typeof error === 'object') {
      return formatError(error.structure, error.received, error.action)(
        error.key,
      )
    }
    return error
  })

  return errors.length ? fail(errors) : pass()
}

const fail = errors => ({
  message: () =>
    `${matcherHint('.toMatchStructure')}\n\n${errors.join('\n\n')}`,
  pass: false,
})

const pass = () => ({
  pass: true,
})
