import { describe, expect, test } from '@jest/globals'
import { encrypt, decrypt } from '../src/utils/common'

describe('common module', () => {
  test('encrypt and decrypt', () => {
    const message = 'fdsajlfdsjafadsjfkldsa'
    const key = '37453990920077435392178753439354'.split('').map(parseInt)
    expect(encrypt(message, key)).toBe(decrypt(message, key))
  })
})
