import { Component } from 'nano-jsx/lib/component'
import { SettingModel, commonStore, settingStore } from '@/store'
import { Fragment } from 'nano-jsx/lib/fragment'
import FormItem from '@/components/FormItem'
import Form from '@/components/Form'
import TextField from '@/components/TextField'
import Icon from '@/components/Icon'
import { mdiDatabase, mdiFolderOpen, mdiKey, mdiLock } from '@mdi/js'
import { useCheckForm } from '@/hooks/useCheckForm'
import { saveSetting } from '@/api/settingApi'
import Checkbox from '@/components/Checkbox'
import { blankPropSize } from '@/utils/common'

type CheckedSetting = Pick<SettingModel, 'database' | 'password' | 'cli'>

export default class Setting extends Component {
  settingStore = settingStore.use()
  commonStore = commonStore.use()

  form: ReturnType<typeof useCheckForm<CheckedSetting>>

  constructor(props: {}) {
    super(props)

    this.form = useCheckForm<CheckedSetting>({
      database: (v) => !!v || 'KeePass 数据库不为空',
      password: (v) => {
        // 不保存密码不校验
        if (!this.settingStore.state.remember) {
          return true
        }
        return !!v || 'KeePass 数据库密码不为空'
      },
      cli: (v) => !!v || 'KeePassXC 位置不为空'
    })
  }

  handleSelectDatabase() {
    const paths = utools.showOpenDialog({
      filters: [{ name: 'KeePass 数据库文件', extensions: ['kdbx'] }]
    })
    if (paths) {
      this.updateSetting({ database: paths[0] })
      this.update()
    }
  }

  handleSelectKeyFile() {
    const paths = utools.showOpenDialog({
      filters: [{ name: '密钥文件', extensions: ['keyx;', 'key'] }]
    })
    if (paths) {
      this.updateSetting({ keyFile: paths[0] })
      this.update()
    }
  }

  handleSelectCLI() {
    let paths: string[] | undefined = undefined
    if (utools.isWindows()) {
      paths = utools.showOpenDialog({
        properties: ['openDirectory']
      })
    } else if (utools.isMacOS()) {
      paths = utools.showOpenDialog({
        defaultPath: '/Applications',
        filters: [{ name: 'KeePassXC.app', extensions: ['app'] }],
        properties: ['openFile']
      })
    } else {
      paths = utools.showOpenDialog({
        properties: ['openFile']
      })
    }
    if (paths) {
      this.updateSetting({ cli: paths[0] })
      this.update()
    }
  }

  handleRemember(remember: boolean) {
    if (remember) {
      // 将内存中的密码保存
      this.updateSetting({
        remember,
        password: this.commonStore.state.password
      })
    } else {
      // 移除密码
      this.updateSetting({ remember, password: '' })
    }
    this.update()
  }

  handleDropFile(key: keyof SettingModel, e: DragEvent) {
    const file = e.dataTransfer?.files[0] as
      | (File & { path: string })
      | undefined
    const path = file?.path
    if (path) {
      this.updateSetting({ [key]: path })
      this.update()
    }
    return
  }

  updateSetting(partial: Partial<SettingModel>) {
    this.settingStore.setState({ ...this.settingStore.state, ...partial })
    this.commonStore.state.dbLastModified = null
  }

  didMount() {
    this.settingStore.subscribe((newState, oldState) => {
      // 新增配置数据不用校验
      if (blankPropSize(newState) <= blankPropSize(oldState)) {
        saveSetting(newState)
        return
      }

      try {
        this.form.checkForm(newState)
        saveSetting(newState)
      } catch (err) {
        // rollback
        this.settingStore.setState(oldState)
        this.commonStore.setState({
          ...this.commonStore.state,
          password: oldState.password
        })
        this.update()
        alert('保存配置失败：' + err)
      }
    })
  }

  didUnmount() {
    this.settingStore.cancel()
  }

  render() {
    return (
      <Fragment>
        <div class="mb-16 ml-2 text-lg">设置</div>
        <Form>
          <FormItem label="数据库" required>
            <div
              class="flex items-center"
              onDrop={(e: DragEvent) => this.handleDropFile('database', e)}
            >
              <TextField
                value={this.settingStore.state.database}
                placeholder="选择 KeePass 数据库文件"
                autofocus={!this.settingStore.state.database}
                onChange={(v) => this.updateSetting({ database: v })}
              ></TextField>
              <div
                class="ml-2 cursor-pointer"
                title="选择 KeePass 数据库文件"
                onClick={() => this.handleSelectDatabase()}
              >
                <Icon path={mdiDatabase} size="small"></Icon>
              </div>
            </div>
          </FormItem>
          <FormItem label="数据库密码" required>
            <TextField
              type="password"
              value={this.commonStore.state.password}
              placeholder="请输入 KeePass 数据库密码"
              autofocus={!this.commonStore.state.password}
              onChange={(password) => {
                this.commonStore.setState({
                  ...this.commonStore.state,
                  password
                })
                if (this.settingStore.state.remember) {
                  this.updateSetting({ password })
                }
              }}
              appendIcon={mdiLock}
            ></TextField>
          </FormItem>
          <FormItem
            label="记住密码"
            help="如果未选择，则密码将仅在内存中，在插件完全退出后需要重新输入"
          >
            <Checkbox
              value={this.settingStore.state.remember}
              onClick={(v) => this.handleRemember(v)}
            ></Checkbox>
          </FormItem>
          <FormItem label="密钥文件">
            <div
              class="flex items-center"
              onDrop={(e: DragEvent) => this.handleDropFile('keyFile', e)}
            >
              <TextField
                value={this.settingStore.state.keyFile}
                placeholder="选择 KeePass 数据库密钥文件"
                onChange={(v) => this.updateSetting({ keyFile: v })}
              ></TextField>
              <div
                class="ml-2 cursor-pointer"
                title="选择密钥文件"
                onClick={() => this.handleSelectKeyFile()}
              >
                <Icon path={mdiKey} size="small"></Icon>
              </div>
            </div>
          </FormItem>
          <FormItem label="KeePassXC 位置" required>
            <div
              class="flex items-center"
              onDrop={(e: DragEvent) => this.handleDropFile('cli', e)}
            >
              <TextField
                value={this.settingStore.state.cli}
                placeholder={
                  utools.isWindows()
                    ? '请选择 KeePassXC 的安装位置'
                    : utools.isMacOS()
                    ? '请选择应用 KeePassXC.app'
                    : '请选择 KeePassXC CLI 命令'
                }
                autofocus={!this.settingStore.state.cli}
                onChange={(v) => this.updateSetting({ cli: v })}
              ></TextField>
              <div
                class="ml-2 cursor-pointer"
                title="选择 KeePassXC 位置"
                onClick={() => this.handleSelectCLI()}
              >
                <Icon path={mdiFolderOpen} size="small"></Icon>
              </div>
            </div>
          </FormItem>
        </Form>
      </Fragment>
    )
  }
}
