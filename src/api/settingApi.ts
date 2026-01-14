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

type SettingConfig = Omit<SettingModel, 'password'>

export function initSetting(): SettingModel {
  const setting = local.get<SettingConfig>(StoreKey.SETTING)
  if (setting === null) {
    const setting: SettingConfig = {
      version: 2,
      database: '',
      remember: false,
      keyFile: '',
      cli: getInitialCLI()
    }
    const password = ''
    local.set(StoreKey.SETTING, setting)
    utools.dbCryptoStorage.setItem(StoreKey.PASSWORD, password)
    return { ...setting, password }
  }

  if (setting.version === 1) {
    const oldSetting = setting as SettingModel
    oldSetting.version = 2
    oldSetting.password = decrypt(oldSetting.password, key)
    const { password, ...newSetting } = oldSetting
    local.set(StoreKey.SETTING, newSetting)
    utools.dbCryptoStorage.setItem(StoreKey.PASSWORD, password)
    return oldSetting
  }

  const password: string = utools.dbCryptoStorage.getItem(StoreKey.PASSWORD)
  return { ...setting, password }
}

export function saveSetting(setting: SettingModel) {
  setting.password = encrypt(setting.password, key)
  local.set(StoreKey.SETTING, setting)
}
