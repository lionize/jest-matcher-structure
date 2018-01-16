<p align="center">
  <img width="200" src="./logo.png" alt="jest-matcher-structure">
</p>

<h2>
  jest-matcher-structure
  <a href="https://travis-ci.org/lionize/jest-matcher-structure">
    <img src="https://img.shields.io/travis/lionize/jest-matcher-structure/master.svg?style=flat-square" alt="Build Status">
  </a>
  <a href="https://github.com/lionize/jest-matcher-structure/releases/tag/v0.1.1">
    <img src="https://img.shields.io/badge/version-0.0.1-green.svg?style=flat-square" alt="v0.1.1">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square">
  </a>
</h2>

A custom `jest` matcher for validating object structures

<a href="#install">Install</a> •
<a href="#usage">Usage</a> •
<a href="#list-of-comparisons">List of Comparisons</a> •
<a href="#todo">TODO</a> •
<a href="#created-by">Created By</a> •
<a href="#license">License</a>

## Install

`$ npm install --save-dev jest-matcher-structure`

## Usage

jest-matcher-structure walks key-by-key through a structure object and a comparison object and verifies that the value in the structure object accurately describes the value in the comparison object.

It's easy to get started! Here's a quick and simple example:

```javascript
import { toMatchStructure } from 'jest-matcher-structure'

expect.extend({ toMatchStructure })

test("structure matches object's structure", () => {
  const structure = {
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    function: n => n > 5,
    literal: 'literal value',
    nested: {
      string: 'string',
      number: 'number',
      function: n => x < 5,
    },
    arrayLiteral: ['hello', 'hi', 1, 2, 3, true, false],
    regex: /\d+/,
    null: null,
  }

  const object = {
    string: 'hello world',
    number: 123,
    boolean: true,
    function: 10,
    literal: 'literal value',
    nested: {
      string: 'string',
      number: 1,
      function: 3,
    },
    arrayLiteral: [false, true, 3, 2, 1, 'hi', 'hello'],
    regex: '1234',
    null: null,
  }

  expect(structure).toMatchStructure(object)
})
```

### Helper Functions

jest-matcher-structure comes with the helper functions `some`, `every`, and `repeat`.

`some` and `every` are for fields where you need to test the comparison value against multiple truths. You pass them an array and jest-matcher-structure works its magic! Here's an example:

```javascript
import { some, every, toMatchStructure } from 'jest-matcher-structure'

test('some and every', () => {
  const structure = {
    field1: some(['A', 'B']),
    field2: every(['string', x => x >= 1200 && x <= 1500]),
  }

  const object = {
    field1: 'A',
    field2: '1300',
  }

  expect(structure).toMatchStructure(object)
})
```

`repeat` is for consuming repeating comparisons in an array. For example, if you need to make sure an array is filled with strings, you can do the following:

```javascript
import { repeat, toMatchStructure } from 'jest-matcher-structure'

test('repeat', () => {
  const structure = {
    field1: [repeat('string')],
  }

  const object = {
    field1: ['hello', 'world', 'fubar'],
  }

  expect(structure).toMatchStructure(object)
})
```

## List of Comparisons

* literal value
* string type
* number type
* boolean type
* function
* regex
* `some`
* `every`
* objects
* arrays
  * exact comparison match
  * repeating values in an array using `repeat`

## Upcoming Changes

* Code refactor
* Flesh out test cases to make sure edge cases are covered
* Rethink `some`, `every`, `repeat`

## Created By

* [Mark Chandler](http://github.com/lionize)

## License

MIT
