import {
  isSome,
  isEvery,
  isRegex,
  isType,
  identity,
  isMatcherObject,
} from './utils'

test('isSome', () => {
  const some = {
    __matcher: 'some',
    array: [1],
  }

  expect(isSome(some)).toBe(true)
})

test('isEvery', () => {
  const every = {
    __matcher: 'every',
    array: [1],
  }

  expect(isEvery(every)).toBe(true)
})

test('isMatcherObject', () => {
  const some = {
    __matcher: 'some',
    array: [1],
  }
  const every = {
    __matcher: 'every',
    array: [1],
  }

  expect(isMatcherObject(some)).toBe(true)
  expect(isMatcherObject(every)).toBe(true)
})

test('isRegex', () => {
  const regex = /\w/
  const notRegex = ''

  expect(isRegex(regex)).toBe(true)
  expect(isRegex(notRegex)).toBe(false)
})

test('isType', () => {
  ;['string', 'boolean', 'number'].forEach(x => expect(isType(x)).toBe(true))

  expect(isType(1)).toBe(false)
})

test('identity', () => {
  expect(identity(1)).toBe(1)
  expect(identity(1)).not.toBe(2)
})
