import { StoreKey } from '@/constant'
import { SettingModel } from '@/store'
import { decrypt, encrypt } from '@/utils/common'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { local } from 'utools-utils'

// @ts-ignore
const key = import.meta.env.VITE_ENCRYPTION_KEY

export function getCompleteCLI(cli: string) {
  if (utools.isWindows()) return join(cli, 'keepassxc-cli.exe')
  if (utools.isMacOS()) return join(cli, 'Contents/MacOS/keepassxc-cli')
  return cli
}

function getInitialCLI() {
  if (utools.isWindows()) {
    const dir = 'C:\\Program Files\\KeePassXC'
    if (existsSync(dir)) return dir
  }
  if (utools.isMacOS()) {
    const app = '/Applications/KeePassXC.app'
    if (existsSync(app)) return app
  }
  return ''
}

export function initSetting() {
  let setting = local.get<SettingModel>(StoreKey.SETTING)
  if (setting === null) {
    setting = {
      version: 1,
      database: '',
      password: '',
      remember: false,
      keyFile: '',
      cli: getInitialCLI()
    }
    local.set(StoreKey.SETTING, setting)
  }
  setting.password = decrypt(setting.password, key)
  return setting
}

export function saveSetting(setting: SettingModel) {
  setting.password = encrypt(setting.password, key)
  local.set(StoreKey.SETTING, setting)
}
