import { NoneTemplate } from 'utools-utils/template'
import type { Action } from 'utools-utils/type'
import { commonStore } from '@/store'
import { render } from 'nano-jsx/lib/core'
import App from '@/App'

export default abstract class AbstractFeature implements NoneTemplate {
  abstract readonly code: string

  commonStore = commonStore.use()

  enter(action: Action) {
    this.commonStore.setState({ ...this.commonStore.state, code: action.code })
    utools.setExpendHeight(500)
    render(<App code={this.code} />, document.documentElement)
  }
}
