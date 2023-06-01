export function booleanProps(obj: { [prop: string]: boolean }) {
  const res: { [prop: string]: true } = {}
  for (const key in obj) {
    if (obj[key] === true) res[key] = true
  }
  return res
}

export function propSize<T extends object>(
  obj: T,
  predicate: (value: any) => boolean
) {
  let len = 0
  for (const key in obj) {
    if (predicate(obj[key])) len++
  }
  return len
}

export function blankPropSize<T extends object>(obj: T) {
  return propSize(obj, (value) => value === '')
}

export function encrypt(message: string, key: number[]) {
  let res = ''
  for (let i = 0; i < message.length; i++) {
    const m = message.charCodeAt(i)
    const k = key[i % key.length]
    res += String.fromCharCode(m ^ k)
  }
  return res
}

export function decrypt(encrypted: string, key: number[]) {
  let res = ''
  for (let i = 0; i < encrypted.length; i++) {
    const e = encrypted.charCodeAt(i)
    const k = key[i % key.length]
    res += String.fromCharCode(e ^ k)
  }
  return res
}
