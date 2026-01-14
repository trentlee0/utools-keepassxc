import { EntryItem, getWindowTitle, searchEntries, entryList } from '@/utils/keepassxc'
import AbstractListFeature from './AbstractListFeature'
import { Action, WindowPayload } from 'utools-utils'

export default class MatchFeature extends AbstractListFeature {
  constructor() {
    super('keepass-match')
  }

  async useCache(): Promise<boolean> {
    return false
  }

  private getMinSubstringAfterSplitting(s: string, separator: string | RegExp) {
    const arr = s.split(separator)
    arr.sort((a, b) => a.length - b.length)
    return arr[0]
  }

  private async getSearchKeyword(action: Action) {
    const windowPayload = action.payload as WindowPayload
    if (windowPayload.app === 'Zen.app') {
      const title = await getWindowTitle('Zen')
      if (
        title.includes(' - ') ||
        title.includes(' | ') ||
        title.includes(' :: ')
      ) {
        return this.getMinSubstringAfterSplitting(title, / - | \| | :: /)
      } else if (title.includes(' — ')) {
        const [_, titleRight] = title.split(' — ')
        return titleRight
      } else if (title.includes('-')) {
        return this.getMinSubstringAfterSplitting(title, '-')
      } else if (title.includes('_')) {
        return this.getMinSubstringAfterSplitting(title, '_')
      }
    } else {
      const url = await utools.readCurrentBrowserUrl()
      const mat = url.match(/(http[s]?:\/\/)([^/]+).*/)
      if (mat) {
        const arr = mat[2].split('.')
        const host = arr
          .slice(Math.max(0, arr.length - 2), arr.length)
          .join('.')
        return host
      }
    }
  }

  async getEntryList(action: Action): Promise<EntryItem[]> {
    const keyword = await this.getSearchKeyword(action)
    if (!keyword) return []
    try {
      return await searchEntries(this.getOptions(), keyword)
    } catch (e) {
      const err = e as Error
      if (err.message.trim() === 'No results for that search term.') {
        utools.showNotification(`没有搜索到“${keyword}”，返回所有条目`)
        return await entryList(this.getOptions())
      }
      console.error(err)
      utools.showNotification(`搜索“${keyword}”时，出现错误：` + err)
      return []
    }
  }
}
