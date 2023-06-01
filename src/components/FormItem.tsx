import { Component } from 'nano-jsx/lib/component'
import { Fragment } from 'nano-jsx/lib/fragment'

export enum AlignMap {
  left = 'text-left',
  center = 'text-center',
  right = 'text-right'
}

export interface FormItemProps {
  label?: string
  align?: keyof typeof AlignMap
  errMsg?: boolean | string
  required?: boolean
  help?: string
  title?: string
  children?: Component
}

export default class FormItem extends Component<FormItemProps> {
  constructor(props: FormItemProps) {
    super(props)
  }

  render() {
    const { align = 'right', title, label, help, required, errMsg } = this.props
    return (
      <Fragment>
        <div class={'col-span-4 cursor-default select-none ' + AlignMap[align]}>
          <span title={title}>{label}</span>
          {help ? (
            <span
              title={help}
              class="ml-1 text-xs text-neutral-700 dark:text-neutral-200"
            >
              ?
            </span>
          ) : null}
          {required ? (
            <span class="ml-px text-sm text-neutral-400">*</span>
          ) : null}
        </div>
        <div class="col-span-5">{this.props.children}</div>
        <div class="col-span-3">
          {errMsg ? <div class="text-xs text-red-500">{errMsg}</div> : null}
        </div>
      </Fragment>
    )
  }
}
