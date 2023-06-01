import * as NProgress from 'nprogress'
import cssInline from 'nprogress/nprogress.css?inline'

NProgress.configure({ showSpinner: false })

export default {
  ...NProgress,
  cssInline: cssInline + `#nprogress .bar { background: green !important; }`
}
