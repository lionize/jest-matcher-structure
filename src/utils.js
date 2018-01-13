export const isSome = x => x.__matcher === 'some'
export const isEvery = x => x.__matcher === 'every'
export const isMatcherObject = x => isSome(x) || isEvery(x)
export const isRegex = x => x instanceof RegExp
export const isType = x => ['string', 'boolean', 'number'].includes(x)
export const identity = x => x
