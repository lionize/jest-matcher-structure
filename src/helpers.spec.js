import { some, every } from './helpers'

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
