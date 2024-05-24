import { Component } from 'nano-jsx/lib/component'
import { Fragment } from 'nano-jsx/lib/fragment'
import { getCompleteCLI } from '@/api/settingApi'
import Icon from '@/components/Icon'
import TextField from '@/components/TextField'
import { settingStore } from '@/store'
import { generatePassword } from '@/utils/keepassxc'
import {
  mdiClipboardTextOutline,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiRefresh
} from '@mdi/js'
import SelectButton from '@/components/SelectButton'


interface GenerateState {
  showPassword: boolean
  showAdvanced: boolean
  password: string
  length: number
  upper?: boolean
  lower?: boolean
  numeric?: boolean
  special?: boolean
  extended?: boolean
  exclude?: string
}

export default class Generator extends Component<any, GenerateState> {
  settingStore = settingStore.use()

  constructor(props: any) {
    super(props)
    this.initState = {
      showPassword: true,
      showAdvanced: false,
      password: '',
      length: 16,
      upper: true,
      lower: true,
      numeric: true,
      special: true,
      extended: false,
      exclude: ''
    }
  }

  async generate(state: Partial<GenerateState>) {
    const newState = { ...this.state, ...state }
    newState.length = this.getLimitLength(newState, newState.length)

    const rules = {
      ...newState,
      exclude: newState.showAdvanced ? newState.exclude : undefined
    }
    const password = await generatePassword(
      getCompleteCLI(this.settingStore.state.cli),
      rules
    )

    newState.password = password
    this.setState(newState, true)
  }

  getLimitLength(state: GenerateState, length: number) {
    let min = 0
    if (state.lower) min++
    if (state.upper) min++
    if (state.numeric) min++
    if (state.extended) min++
    if (state.special) min += 6
    if (min < 1) min = 1
    if (length < min) length = min
    if (length > 256) length = 256
    return length
  }

  handleLengthInput(e: Event) {
    this.generate({ length: parseInt((e.target as HTMLInputElement).value) })
  }

  didMount() {
    this.generate(this.state)
  }

  render() {
    return (
      <Fragment>
        <div class="mx-auto mt-32 w-2/3">
          <div class="flex items-center">
            <TextField
              type={this.state.showPassword ? 'text' : 'password'}
              placeholder="密码"
              value={this.state.password}
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
              onClick={() => this.generate(this.state)}
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
          </div>
          <div class="mt-3 flex">
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
              class="ml-3 w-24 flex-none rounded-md border border-gray-300 bg-transparent pl-2 outline-none transition focus-within:border-gray-500 dark:border-stone-600 dark:focus-within:border-gray-400"
              type="number"
              min="1"
              max="128"
              value={this.state.length?.toString()}
              onChange={this.handleLengthInput.bind(this)}
            />
          </div>
          <div class="mt-3">
            <label>字符类型：</label>
            <div class="flex justify-center">
              <SelectButton
                selected={this.state.upper}
                onClick={(upper) => this.generate({ upper })}
              >
                A-Z
              </SelectButton>
              <SelectButton
                selected={this.state.lower}
                onClick={(lower) => this.generate({ lower })}
              >
                a-z
              </SelectButton>
              <SelectButton
                selected={this.state.numeric}
                onClick={(numeric) => this.generate({ numeric })}
              >
                0-9
              </SelectButton>
              <SelectButton
                selected={this.state.special}
                onClick={(special) => this.generate({ special })}
              >
                / * + & ...
              </SelectButton>
              <SelectButton
                selected={this.state.extended}
                onClick={(extended) => this.generate({ extended })}
              >
                扩展 ASCII
              </SelectButton>
              <SelectButton
                selected={this.state.showAdvanced}
                onClick={(showAdvanced) => this.generate({ showAdvanced })}
              >
                高级
              </SelectButton>
            </div>
          </div>
          <div class="mt-3">
            {this.state.showAdvanced ? (
              <TextField
                label="排除字符："
                value={this.state.exclude}
                onChange={(exclude) => this.generate({ exclude })}
              ></TextField>
            ) : null}
          </div>
        </div>
      </Fragment>
    )
  }
}
