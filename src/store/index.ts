import { initSetting } from '@/api/settingApi'
import { KeePassXCOptions } from '@/utils/keepassxc'
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

// commonStore 仅保存在内存中
export const commonStore = new Store<CommonModel>({
  dbLastModified: null,
  password: defaultSetting.password
})
