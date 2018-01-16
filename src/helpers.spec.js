import { some, every, repeat } from './helpers'

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

test('repeat', () => {
  const structure = 'string'
  const expected = { __matcher: 'repeat', structure }

  expect(repeat(structure)).toEqual(expected)
})
