import { entryList, EntryItem } from '@/utils/keepassxc'
import AbstractListFeature from './AbstractListFeature'
import { isDbModified } from '@/store'

export default class SearchFeature extends AbstractListFeature {
  constructor() {
    super('keepass-search')
  }

  async useCache(): Promise<boolean> {
    return !isDbModified(this.settingStore, this.commonStore)
  }

  async getEntryList(): Promise<EntryItem[]> {
    return await entryList(this.getOptions())
  }
}
