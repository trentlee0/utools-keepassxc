import { describe, expect, test } from '@jest/globals'
import { AccountEntry, parseAccountEntry } from '../src/utils/keepassxc'

describe('keepassxc module', () => {
  test('parseAccountEntry', () => {
    const stdout = `Title: Example Account: hello
UserName: abc@example.com
Password: occaecatfdsa
URL: https://example.com
Notes: Ea ad consequat consectetur ex. \nExercitation duis et laborum. 
Uuid: {abcd-efgh-ijkl-mnop}
Tags: Computer`
    expect(parseAccountEntry(stdout)).toEqual(<AccountEntry>{
      title: 'Example Account: hello',
      username: 'abc@example.com',
      password: 'occaecatfdsa',
      url: 'https://example.com',
      notes: 'Ea ad consequat consectetur ex. \nExercitation duis et laborum. ',
      uuid: '{abcd-efgh-ijkl-mnop}',
      tags: 'Computer'
    })
  })
})
