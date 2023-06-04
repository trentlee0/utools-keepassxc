import { entryList, EntryItem } from '@/utils/keepassxc'
import { statSync } from 'node:fs'
import AbstractListFeature from './AbstractListFeature'

export default class SearchFeature extends AbstractListFeature {
  constructor() {
    super('keepass-search')
  }

  private isModified() {
    try {
      const fileModified = statSync(this.settingStore.state.database).mtimeMs
      if (
        this.commonStore.state.dbLastModified &&
        this.commonStore.state.dbLastModified >= fileModified
      ) {
        return false
      }
      this.commonStore.state.dbLastModified = fileModified
    } catch (ignored) {}
    return true
  }

  async useCache(): Promise<boolean> {
    return !this.isModified()
  }

  async getEntryList(): Promise<EntryItem[]> {
    return await entryList(this.getOptions())
  }
}
