export function flushAllPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

export function waitMilliseconds(ms) {
  return new Promise((res) => {
    setTimeout(() => {
      res()
    }, ms)
  })
}

export const has = Object.prototype.hasOwnProperty
