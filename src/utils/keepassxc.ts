import { execAppleScript, spawnCommand } from 'utools-utils/preload'
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
  title: string
  group: string
  entryName: string

  constructor(entryName: string) {
    this.entryName = entryName
    const levels = entryName.substring(1).split('/')
    const n = levels.length
    this.title = levels[n - 1]
    this.group = levels.slice(0, n - 1).join('/')
  }

  static generateEntryName(title: string, group?: string) {
    return group ? `/${group}/${title}` : `/${title}`
  }
}

export async function searchEntries(
  options: KeePassXCOptions,
  keyword: string
) {
  const stdout = await runKeePassCLI(options, 'search', keyword)
  const entries = stdout.trim().split('\n')
  return entries.map((entry) => new EntryItem(entry))
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

function getPasswordArgs(rules: GenerationRules) {
  return [
    ...getArg(rules.length, '--length', rules.length?.toString()),
    ...getArg(rules.lower, '--lower'),
    ...getArg(rules.upper, '--upper'),
    ...getArg(rules.numeric, '--numeric'),
    ...getArg(rules.special, '--special'),
    ...getArg(rules.extended, '--extended'),
    ...getArg(rules.exclude, '--exclude', rules.exclude),
    ...getArg(rules.custom, '--custom', rules.custom)
  ]
}

export async function generatePassword(
  keePassXCCLI: string,
  rules: GenerationRules
) {
  const { stdout } = await spawnCommand(keePassXCCLI, [
    'generate',
    ...getPasswordArgs(rules)
  ])
  return stdout.trim()
}

export interface AccountInfo {
  title: string
  group: string
  username?: string
  url?: string
  notes?: string
}

export async function operateEntry(
  command: 'add' | 'edit',
  options: KeePassXCOptions,
  account: AccountInfo,
  passwordRules?: GenerationRules
) {
  const entryName = EntryItem.generateEntryName(account.title, account.group)
  const stdout = await runKeePassCLI(
    options,
    command,
    entryName,
    ...getArg(account.username, '--username', account.username),
    ...getArg(account.url, '--url', account.url),
    ...getArg(account.notes, '--notes', account.notes),
    ...(passwordRules ? ['--generate', ...getPasswordArgs(passwordRules)] : [])
  )
  return { stdout, entryName }
}

export async function addEntry(
  options: KeePassXCOptions,
  account: AccountInfo,
  passwordRules?: GenerationRules
) {
  return await operateEntry('add', options, account, passwordRules)
}

export async function editEntry(
  options: KeePassXCOptions,
  account: AccountInfo,
  passwordRules?: GenerationRules
) {
  return await operateEntry('edit', options, account, passwordRules)
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

export async function searchInApp(searchText: string, password: string) {
  const script = `
    tell application "System Events"
      if (name of processes) does not contain "KeePassXC" then
        do shell script "open -a KeePassXC"
        repeat until processes where name is not (exists "KeePassXC")
        end repeat
      end if
      do shell script "open -a KeePassXC"
      tell application "KeePassXC" to activate
  
      tell process "KeePassXC"
        if (title of window 1) is equal to "KeePassXC" then
          click menu item 1 of menu "最近的数据库" of menu item "最近的数据库" of menu "数据库" of menu bar item "数据库" of menu bar 1
          delay 0.5
        end if
        if (title of window 1) contains "锁定" then
          keystroke "${password}"
          key code 76
          delay 0.5
        end if
        set value of text field 1 of window 1 to "${searchText}"
      end tell
    end tell`
  await execAppleScript(script)
}
