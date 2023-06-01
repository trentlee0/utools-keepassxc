import { describe, expect, test } from '@jest/globals'
import { AccountEntry, parseAccountEntry } from '../src/utils/keepassxc'

describe('keepassxc module', () => {
  test('parseAccountEntry with Notes multi lines', () => {
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

  test('parseAccountEntry with Notes one line', () => {
    const stdout = `Title: One Account
UserName: one@example.com
Password: 4793214712ffa
URL: https://example.com
Notes: Pariatur fugiat excepteur voluptate excepteur proident do nisi consectetur.
Uuid: {abcd-efgh-ijkl-mnop}
Tags: \n`
    expect(parseAccountEntry(stdout)).toEqual(<AccountEntry>{
      title: 'One Account',
      username: 'one@example.com',
      password: '4793214712ffa',
      url: 'https://example.com',
      notes: 'Pariatur fugiat excepteur voluptate excepteur proident do nisi consectetur.',
      uuid: '{abcd-efgh-ijkl-mnop}',
      tags: ''
    })
  })
})
