import { spawnCommand } from 'utools-utils/preload'
import { setTimeout } from 'node:timers/promises'

export interface KeePassXCOptions {
  cli: string
  database: string
  password: string
  keyFile?: string
}

function getArgs(options: Pick<KeePassXCOptions, 'database' | 'keyFile'>) {
  const { keyFile, database } = options
  const args: string[] = []
  if (keyFile) args.push('--key-file', keyFile)
  args.push(database)
  return args
}

export class SearchItem {
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
  const { cli, password } = options
  const { stdout: value } = await spawnCommand(
    cli,
    ['search', ...getArgs(options), keyword],
    {},
    [password]
  )
  const entries = value.trim().split('\n')
  return entries.map((entry) => {
    const levels = entry.substring(1).split('/')
    const n = levels.length
    const title = levels[n - 1]
    const group = levels.slice(0, n - 1).join('/')
    return new SearchItem(title, group, entry)
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
  const { cli, password } = options
  if (attribute) {
    const extraArgs = [
      ...(attribute === 'totp' ? ['--totp'] : ['--attributes', attribute])
    ]
    const { stdout } = await spawnCommand(
      cli,
      ['show', ...getArgs(options), entryName, ...extraArgs],
      {},
      [password]
    )
    return stdout.trimEnd()
  }

  const { stdout } = await spawnCommand(
    cli,
    ['show', ...getArgs(options), entryName, '--show-protected'],
    {},
    [password]
  )
  return parseAccountEntry(stdout)
}

export function parseAccountEntry(stdout: string): AccountEntry {
  const props = stdout.split('\n')
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
      `${split('Notes')}\n` +
      props
        .filter((_value, index) => !set.has(index))
        .reduce((pre, cur) => `${pre}\n${cur}`),
    uuid: split('Uuid'),
    tags: split('Tags')
  }
}

export async function clipEntryAttr(
  options: KeePassXCOptions,
  entryName: string,
  attribute: string
) {
  const { cli, password } = options
  const { stdout } = await spawnCommand(
    cli,
    ['clip', ...getArgs(options), entryName, '--attribute', attribute],
    {},
    [password]
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
  const args: string[] = []
  if (rules.length) args.push('--length', rules.length.toString())
  if (rules.lower) args.push('--lower')
  if (rules.upper) args.push('--upper')
  if (rules.numeric) args.push('--numeric')
  if (rules.special) args.push('--special')
  if (rules.extended) args.push('--extended')
  if (rules.exclude) args.push('--exclude', rules.exclude)
  if (rules.custom) args.push('--custom', rules.custom)
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
    await setTimeout(5)
    utools.hideMainWindowTypeString(password)
  }
}
