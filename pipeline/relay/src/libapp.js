import crypto from 'crypto' // node lib for random ids

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isObject(node) {
  return node !== null && typeof node === 'object' && !Array.isArray(node)
}

// print a complete object tree (console.log only does to depth 2)
export function print(...obj) {
  console.dir(...obj, { depth: null })
}

// https://stackoverflow.com/questions/22266826/how-can-i-do-a-shallow-comparison-of-the-properties-of-two-objects-with-javascri
export function shallowCompare(obj1, obj2) {
  return (
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
    )
  )
}

export function getSet(str) {
  return new Set(str.split(','))
}