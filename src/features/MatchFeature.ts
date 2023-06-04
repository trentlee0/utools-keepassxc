import { EntryItem, searchEntries } from '@/utils/keepassxc'
import AbstractListFeature from './AbstractListFeature'

export default class MatchFeature extends AbstractListFeature {
  constructor() {
    super('keepass-match')
  }

  async useCache(): Promise<boolean> {
    return false
  }

  async getEntryList(): Promise<EntryItem[]> {
    const url = await utools.readCurrentBrowserUrl()
    const mat = url.match(/(http[s]?:\/\/)([^/]+).*/)
    if (mat) {
      return await searchEntries(this.getOptions(), mat[2])
    }
    return []
  }
}
