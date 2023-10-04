import { spawnCommand } from 'utools-utils/preload'
import { setTimeout } from 'node:timers/promises'
import { getMessage } from './common'

export interface KeePassXCOptions {
  cli: string
  database: string
  password: string
  keyFile?: string
}

function getArg(
  condition: any,
  name: string,
  ...values: Array<string | undefined>
): string[] {
  if (!condition) return []
  const arr: string[] = [name]
  for (const value of values) {
    if (value !== undefined) arr.push(value)
  }
  return arr
}

async function runKeePassCLI(
  options: KeePassXCOptions,
  subCommand: string,
  ...extraArgs: string[]
) {
  const { cli, password, keyFile, database } = options

  try {
    const { stdout } = await spawnCommand(
      cli,
      [
        subCommand,
        database,
        ...getArg(keyFile, '--key-file', keyFile),
        ...extraArgs
      ],
      [password],
      {}
    )
    return stdout
  } catch (err) {
    const message = getMessage(err)
      .split('\n')
      .filter(
        (item) =>
          !item.startsWith('输入密码以解锁') &&
          !item.startsWith('Enter password to unlock')
      )
      .join('\n')
    throw new Error(message)
  }
}

export class EntryItem {
  constructor(
    public title: string,
    public group: string,
    public entryName: string
  ) {}
}

export async function searchEntries(
  options: KeePassXCOptions,
  keyword: string
) {
  const stdout = await runKeePassCLI(options, 'search', keyword)
  const entries = stdout.trim().split('\n')
  return entries.map((entry) => {
    const levels = entry.substring(1).split('/')
    const n = levels.length
    const title = levels[n - 1]
    const group = levels.slice(0, n - 1).join('/')
    return new EntryItem(title, group, entry)
  })
}

export function entryList(options: KeePassXCOptions) {
  return searchEntries(options, '')
}

export interface AccountEntry {
  title: string
  username: string
  password: string
  url: string
  notes: string
  uuid: string
  tags: string
}

export type ExtendedAttribute = keyof AccountEntry | 'totp'

/**
 * 获取条目完整信息
 */
export async function showEntry(
  options: KeePassXCOptions,
  entryName: string
): Promise<AccountEntry>
/**
 * 获取条目指定属性信息
 */
export async function showEntry(
  options: KeePassXCOptions,
  entryName: string,
  attribute: ExtendedAttribute
): Promise<string>

export async function showEntry(
  options: KeePassXCOptions,
  entryName: string,
  attribute?: ExtendedAttribute
) {
  if (attribute) {
    const stdout = await runKeePassCLI(
      options,
      'show',
      entryName,
      ...(attribute === 'totp' ? ['--totp'] : ['--attributes', attribute])
    )
    return stdout.trimEnd()
  }

  const stdout = await runKeePassCLI(
    options,
    'show',
    entryName,
    '--show-protected'
  )
  return parseAccountEntry(stdout)
}

export function parseAccountEntry(stdout: string): AccountEntry {
  const props = stdout.replace(/\n$/, '').split('\n')
  const lineMap = {
    Title: 0,
    UserName: 1,
    Password: 2,
    URL: 3,
    Notes: 4,
    Uuid: props.length - 2,
    Tags: props.length - 1
  }

  const split = (key: keyof typeof lineMap) => {
    const sep = ': '
    const line = props[lineMap[key]]
    const i = line.indexOf(sep)
    if (i === -1) return ''
    return line.substring(i + sep.length)
  }
  const set = new Set(Object.values(lineMap))
  return {
    title: split('Title'),
    username: split('UserName'),
    password: split('Password'),
    url: split('URL'),
    notes:
      split('Notes') +
      props
        .filter((_value, index) => !set.has(index))
        .reduce((pre, cur) => `${pre}\n${cur}`, ''),
    uuid: split('Uuid'),
    tags: split('Tags')
  }
}

export async function clipEntryAttr(
  options: KeePassXCOptions,
  entryName: string,
  attribute: string
) {
  const stdout = await runKeePassCLI(
    options,
    'clip',
    entryName,
    '--attribute',
    attribute
  )
  return stdout.trim()
}

export interface GenerationRules {
  length?: number
  // Use lowercase characters
  lower?: boolean
  // Use uppercase characters
  upper?: boolean
  // Use numbers
  numeric?: boolean
  // Use special characters
  special?: boolean
  // Use extended ASCII
  extended?: boolean
  // Exclude character set
  exclude?: string
  // Use custom character set
  custom?: string
}

export async function generatePassword(
  keePassXCCLI: string,
  rules: GenerationRules
) {
  const args: string[] = [
    ...getArg(rules.length, '--length', rules.length?.toString()),
    ...getArg(rules.lower, '--lower'),
    ...getArg(rules.upper, '--upper'),
    ...getArg(rules.numeric, '--numeric'),
    ...getArg(rules.special, '--special'),
    ...getArg(rules.extended, '--extended'),
    ...getArg(rules.exclude, '--exclude', rules.exclude),
    ...getArg(rules.custom, '--custom', rules.custom)
  ]

  const { stdout } = await spawnCommand(keePassXCCLI, ['generate', ...args])
  return stdout.trim()
}

export async function inputAccount(username?: string, password?: string) {
  if (!username && !password) return

  if (!username) {
    utools.hideMainWindowTypeString(password ?? '')
  } else if (!password) {
    utools.hideMainWindowTypeString(username)
  } else {
    utools.hideMainWindowTypeString(username)
    utools.simulateKeyboardTap('tab')
    await setTimeout(50)
    utools.hideMainWindowTypeString(password)
  }
}
