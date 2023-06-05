import type { Action, ListItem, ListRenderFunction } from 'utools-utils'
import { searchList, MutableListTemplate, hideAndOutPlugin } from 'utools-utils'
import {
  showEntry,
  inputAccount,
  KeePassXCOptions,
  ExtendedAttribute,
  EntryItem
} from '@/utils/keepassxc'
import $ from 'cash-dom'
import NProgress from '@/utils/nprogress'
import { commonStore, settingStore } from '@/store'
import { setTimeout } from 'node:timers/promises'
import { getCompleteCLI } from '@/api/settingApi'
import { getMessage } from '@/utils/common'

interface SearchItem extends ListItem {
  description: string
  entryName: string
}

export default abstract class AbstractListFeature
  implements MutableListTemplate
{
  code: string
  $list: Array<SearchItem> = []

  settingStore = settingStore.use()
  commonStore = commonStore.use()

  constructor(code: string) {
    this.code = code
    this.handleKeyDown()
  }

  private handleKeyDown() {
    window.addEventListener('keydown', async (e) => {
      if (this.commonStore.state.code !== this.code) return

      const isModifier = () => (utools.isMacOS() ? e.metaKey : e.ctrlKey)
      if (!isModifier()) return
      const getEntryName = () => {
        const title = $('.list-item-selected .list-item-title').text()
        const desc = $('.list-item-selected .list-item-description').text()
        return `/${desc}/${title}`
      }
      const entryName = getEntryName()
      if (e.key === 'b') {
        await this.copyEntryAttr(entryName, 'username')
      } else if (e.key === 'c') {
        await this.copyEntryAttr(entryName, 'password')
      } else if (e.code === 'KeyU') {
        if (e.shiftKey) {
          const url = await showEntry(this.getOptions(), entryName, 'url')
          utools.shellOpenExternal(url)
          utools.hideMainWindow()
        } else {
          await this.copyEntryAttr(entryName, 'url')
        }
      } else if (e.key === 'i') {
        await this.copyEntryAttr(entryName, 'title')
      } else if (e.key === 't') {
        await this.copyEntryAttr(entryName, 'totp')
      }
    })
  }

  private async copyEntryAttr(entryName: string, attribute: ExtendedAttribute) {
    try {
      const s = await showEntry(this.getOptions(), entryName, attribute)
      utools.copyText(s)
      utools.hideMainWindow()
    } catch (err) {
      alert(err)
    }
  }

  getOptions(): KeePassXCOptions {
    return {
      ...this.settingStore.state,
      password: this.commonStore.state.password,
      cli: this.commonStore.state.completeCLI
    }
  }

  abstract useCache(): Promise<boolean>

  abstract getEntryList(): Promise<EntryItem[]>

  async enter(action: Action, render: ListRenderFunction) {
    this.commonStore.setState({ ...this.commonStore.state, code: action.code })

    // 数据简单校验
    if (
      !this.settingStore.state.cli ||
      !this.settingStore.state.database ||
      (this.settingStore.state.remember && !this.settingStore.state.password) ||
      (!this.settingStore.state.remember && !this.commonStore.state.password)
    ) {
      utools.showNotification('请填入必要的配置项！')
      await setTimeout(100)
      utools.redirect('KeePassXC Setting', '')
      return
    }

    // 未注入 NProgress 的样式
    if (!$('head style').is('#np-style')) {
      $('head').prepend(`<style id="np-style">${NProgress.cssInline}</style>`)
      // 隐藏自定义页面
      $('#app').css('display', 'none')
    }

    NProgress.start()

    // 文件未更改，就读取缓存中的账号列表
    if (await this.useCache()) {
      render(this.$list)
      NProgress.done()
      return
    }

    try {
      // 刷新命令行的路径
      this.commonStore.setState({
        ...this.commonStore.state,
        completeCLI: getCompleteCLI(this.settingStore.state.cli)
      })
      const list = await this.getEntryList()
      render(
        list.map(({ title, group, entryName }) => ({
          title,
          description: group,
          entryName
        }))
      )
    } catch (err) {
      utools.showNotification('获取账号列表失败：' + getMessage(err))
    }
    NProgress.done()
  }

  search(action: Action, searchWord: string, render: ListRenderFunction) {
    if (searchWord) {
      const words = searchWord.split(/ +/).filter((value) => value)
      render(searchList(this.$list, words))
    } else {
      render(this.$list)
    }
  }

  async select(action: Action, item: SearchItem) {
    try {
      const entry = await showEntry(this.getOptions(), item.entryName)
      if (!entry.username && !entry.password) {
        utools.showNotification(
          '没有用户名或密码。\n获取到备注：' + entry.notes
        )
      } else {
        await inputAccount(entry.username, entry.password)
      }
      hideAndOutPlugin()
    } catch (err) {
      alert(err)
    }
  }
}
