import { getCompleteCLI, initSetting } from '@/api/settingApi'
import { KeePassXCOptions } from '@/utils/keepassxc'
import { statSync } from 'node:fs'
import { Store } from 'nano-jsx/lib/store'

export interface SettingModel extends KeePassXCOptions {
  version: number
  remember: boolean
}

const defaultSetting = initSetting()
export const settingStore = new Store<SettingModel>(defaultSetting)

export interface CommonModel {
  code: string
  dbLastModified: number | null
  completeCLI: string
  password: string
}

const defaultCommon = {
  dbLastModified: null,
  password: defaultSetting.password,
  // 初始化命令行的路径
  completeCLI: getCompleteCLI(defaultSetting.cli)
}
// commonStore 仅保存在内存中
export const commonStore = new Store<CommonModel>(defaultCommon)

export function getKeePassXCOptions(
  settingStore: Pick<Store<SettingModel>, 'state'>,
  commonStore: Pick<Store<CommonModel>, 'state'>
): KeePassXCOptions {
  return {
    ...settingStore.state,
    password: commonStore.state.password,
    cli: commonStore.state.completeCLI
  }
}

export function isDbModified(
  settingStore: Pick<Store<SettingModel>, 'state'>,
  commonStore: Pick<Store<CommonModel>, 'state'>
) {
  try {
    const fileModified = statSync(settingStore.state.database).mtimeMs
    if (
      commonStore.state.dbLastModified &&
      commonStore.state.dbLastModified >= fileModified
    ) {
      return false
    }
    commonStore.state.dbLastModified = fileModified
  } catch (ignored) {}
  return true
}
