import { Component } from 'nano-jsx/lib/component'
import { Fragment } from 'nano-jsx/lib/fragment'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import TextField from '@/components/TextField'
import { commonStore, getKeePassXCOptions, settingStore } from '@/store'
import {
  AccountInfo,
  EntryItem,
  GenerationRules,
  operateEntry,
  searchEntries,
  showEntry,
  searchInApp
} from '@/utils/keepassxc'
import {
  mdiClipboardTextOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiRefresh
} from '@mdi/js'
import Form from '@/components/Form'
import FormItem from '@/components/FormItem'
import Textarea from '@/components/Textarea'
import SelectButton from '@/components/SelectButton'
import { getMessage } from '@/utils/common'
import Select, { SelectOption } from '@/components/Select'
import Checkbox from '@/components/Checkbox'
import NProgress from '@/utils/nprogress'

interface PasswordRules extends GenerationRules {
  length: number

  password: string
  showAdvanced: boolean
}

interface EntryCreatorState extends AccountInfo, PasswordRules {
  showPassword: boolean
  isGeneratePassword: boolean
  groups: SelectOption[]
  lastEntryName?: string
}

export default class EntryCreator extends Component<any, EntryCreatorState> {
  private textFieldRef: TextField | null = null

  settingStore = settingStore.use()
  commonStore = commonStore.use()

  private readonly ROOT_GROUP = { text: '根群组', value: '' }

  constructor(props: any) {
    super(props)
    this.initState = {
      title: '',
      group: '',
      password: '',
      isGeneratePassword: false,
      showPassword: false,
      showAdvanced: false,
      length: 16,
      upper: true,
      lower: true,
      numeric: true,
      special: true,
      extended: false,
      exclude: '',
      groups: [this.ROOT_GROUP]
    }
  }

  async updateGenerationRules(partial: Partial<PasswordRules>) {
    const newState: EntryCreatorState = { ...this.state, ...partial }
    newState.length = this.getLimitLength(newState, newState.length)
    this.setState(newState, true)
  }

  updateAccount(partial: Partial<AccountInfo>, shouldUpdate?: boolean) {
    this.setState({ ...this.state, ...partial }, shouldUpdate)
  }

  getLimitLength(passwordRules: PasswordRules, length: number) {
    let min = 0
    if (passwordRules.lower) min++
    if (passwordRules.upper) min++
    if (passwordRules.numeric) min++
    if (passwordRules.extended) min++
    if (passwordRules.special) min += 6
    if (min < 1) min = 1
    if (length < min) length = min
    if (length > 256) length = 256
    return length
  }

  isAdd() {
    return (
      this.state.lastEntryName !==
      EntryItem.generateEntryName(this.state.title, this.state.group)
    )
  }

  isAdded() {
    return !!this.state.lastEntryName
  }

  hasPassword() {
    return !!this.state.password
  }

  handleLengthInput(e: Event) {
    this.updateGenerationRules({
      length: parseInt((e.target as HTMLInputElement).value)
    })
  }

  async handleOperateAccount(regenerate?: boolean) {
    NProgress.start()
    try {
      const options = getKeePassXCOptions(this.settingStore, this.commonStore)
      const command = this.isAdd() ? 'add' : 'edit'
      const { entryName } = await operateEntry(
        command,
        options,
        this.state,
        this.state.isGeneratePassword || regenerate ? this.state : undefined
      )
      const entry = await showEntry(options, entryName)
      let { isGeneratePassword } = this.state
      if (!this.hasPassword() && this.state.isGeneratePassword) {
        // 取消下次生成密码
        isGeneratePassword = false
      }
      this.setState(
        {
          ...this.state,
          ...entry,
          lastEntryName: entryName,
          isGeneratePassword
        },
        true
      )
      NProgress.done()
    } catch (err) {
      NProgress.done()
      alert((this.isAdd() ? '添加' : '编辑') + '账号失败：' + getMessage(err))
    }
  }

  async handleShowInKeePassXC() {
    await searchInApp(this.state.title, this.settingStore.state.password)
  }

  didMount() {
    this.setState(
      {
        ...this.state,
        title: '',
        username: '',
        url: '',
        notes: '',
        password: '',
        isGeneratePassword: false,
        lastEntryName: undefined
      },
      true
    )
    this.textFieldRef?.focus()
    if (this.state.groups.length <= 1) {
      searchEntries(
        getKeePassXCOptions(this.settingStore, this.commonStore),
        ''
      ).then((arr) => {
        const set = new Set<string>()
        const groups = new Array<SelectOption>()
        for (const { group } of arr) {
          if (!set.has(group)) {
            set.add(group)
            groups.push({
              text:
                group === this.ROOT_GROUP.value ? this.ROOT_GROUP.text : group,
              value: group
            })
          }
        }
        this.setState({ ...this.state, groups, group: groups[0].value }, true)
        this.textFieldRef?.focus()
      })
    }
  }

  render() {
    return (
      <Fragment>
        <Form>
          <FormItem label="标题" required>
            <TextField
              ref={(el) => (this.textFieldRef = el)}
              type="text"
              autofocus
              value={this.state.title}
              disabled={!this.isAdd()}
              onChange={(title) => this.updateAccount({ title })}
            ></TextField>
          </FormItem>

          <FormItem label="用户名">
            <TextField
              type="text"
              value={this.state.username}
              onChange={(username) => this.updateAccount({ username })}
            ></TextField>
          </FormItem>

          <FormItem label="密码">
            <div class="flex items-center">
              {!this.hasPassword() && (
                <div class="mr-2 flex h-[30px] flex-none items-center">
                  <Checkbox
                    value={this.state.isGeneratePassword}
                    title="生成密码"
                    onClick={(isGeneratePassword) =>
                      this.setState({ ...this.state, isGeneratePassword }, true)
                    }
                  ></Checkbox>
                </div>
              )}
              {this.hasPassword() && (
                <Fragment>
                  <TextField
                    type={this.state.showPassword ? 'text' : 'password'}
                    value={this.state.password}
                    readonly
                    appendIcon={
                      this.state.showPassword ? mdiEyeOutline : mdiEyeOffOutline
                    }
                    onAppendClick={() => {
                      const showPassword = !this.state.showPassword
                      this.setState({ ...this.state, showPassword }, true)
                    }}
                  ></TextField>
                  <div
                    class="ml-2 cursor-pointer hover:opacity-90"
                    title="重新生成"
                    onClick={() => {
                      this.handleOperateAccount(true)
                    }}
                  >
                    <Icon path={mdiRefresh} size="small"></Icon>
                  </div>
                  <div
                    class="ml-2 cursor-pointer"
                    title="复制密码"
                    onClick={() => {
                      utools.copyText(this.state.password)
                      utools.hideMainWindow()
                    }}
                  >
                    <Icon path={mdiClipboardTextOutline} size="small"></Icon>
                  </div>
                </Fragment>
              )}
            </div>
          </FormItem>

          {(this.state.isGeneratePassword || this.hasPassword()) && (
            <FormItem>
              <div class="text-sm font-light">
                <div class="flex">
                  <label class="select-none">长度：</label>
                  <input
                    class="flex-grow bg-transparent"
                    type="range"
                    min="1"
                    max="128"
                    step="1"
                    value={this.state.length}
                    onChange={this.handleLengthInput.bind(this)}
                  />
                  <input
                    class="ml-3 w-16 flex-none rounded-md border border-gray-300 bg-transparent pl-2 outline-none transition focus-within:border-gray-500 dark:border-stone-600 dark:focus-within:border-gray-400"
                    type="number"
                    min="1"
                    max="128"
                    value={this.state.length?.toString()}
                    onChange={this.handleLengthInput.bind(this)}
                  />
                </div>
                <div class="mt-2">
                  <label>字符类型：</label>
                  <div>
                    <div class="mt-2 flex justify-center text-xs">
                      <SelectButton
                        type="small"
                        selected={this.state.upper}
                        onClick={(upper) =>
                          this.updateGenerationRules({ upper })
                        }
                      >
                        A-Z
                      </SelectButton>
                      <SelectButton
                        type="small"
                        selected={this.state.lower}
                        onClick={(lower) =>
                          this.updateGenerationRules({ lower })
                        }
                      >
                        a-z
                      </SelectButton>
                      <SelectButton
                        type="small"
                        selected={this.state.numeric}
                        onClick={(numeric) => {
                          this.updateGenerationRules({ numeric })
                        }}
                      >
                        0-9
                      </SelectButton>
                      <SelectButton
                        type="small"
                        selected={this.state.special}
                        onClick={(special) =>
                          this.updateGenerationRules({ special })
                        }
                      >
                        / * + & ...
                      </SelectButton>
                      <SelectButton
                        type="small"
                        selected={this.state.extended}
                        onClick={(extended) =>
                          this.updateGenerationRules({ extended })
                        }
                      >
                        扩展 ASCII
                      </SelectButton>
                      <SelectButton
                        type="small"
                        selected={this.state.showAdvanced}
                        onClick={(showAdvanced) =>
                          this.updateGenerationRules({ showAdvanced })
                        }
                      >
                        高级
                      </SelectButton>
                    </div>
                  </div>
                </div>
                <div class="mt-3">
                  {this.state.showAdvanced ? (
                    <TextField
                      label="排除字符："
                      value={this.state.exclude}
                      onChange={(exclude) =>
                        this.updateGenerationRules({ exclude })
                      }
                    ></TextField>
                  ) : null}
                </div>
              </div>
            </FormItem>
          )}

          <FormItem label="URL">
            <TextField
              type="text"
              value={this.state.url}
              onChange={(url) => this.updateAccount({ url })}
            ></TextField>
          </FormItem>

          <FormItem label="备注" vertical="top">
            <Textarea
              value={this.state.notes}
              onChange={(notes) => this.updateAccount({ notes })}
            ></Textarea>
          </FormItem>

          <FormItem label="群组">
            <Select
              disabled={!this.isAdd()}
              value={this.state.group}
              options={this.state.groups}
              onChange={(group) => this.updateAccount({ group }, true)}
            ></Select>
          </FormItem>

          <FormItem>
            <Button
              class="w-full bg-green-600 text-white"
              onClick={() => this.handleOperateAccount()}
            >
              {this.isAdd() ? '添加' : '保存'}
            </Button>
          </FormItem>

          {this.isAdded() ? (
            <FormItem>
              <Button
                class="w-full bg-green-600 text-white"
                onClick={() => this.handleShowInKeePassXC()}
              >在 KeePassXC 中显示</Button>
            </FormItem>
          ) : null}
        </Form>
      </Fragment>
    )
  }
}
