import { Component } from 'nano-jsx/lib/component'
import { Fragment } from 'nano-jsx/lib/fragment'

export enum HorizontalMap {
  left = 'justify-start',
  center = 'text-center',
  right = 'justify-end'
}

export enum VerticalMap {
  top = 'items-start',
  center = 'items-center',
  bottom = 'items-bottom'
}

export interface FormItemProps {
  label?: string
  horizontal?: keyof typeof HorizontalMap
  vertical?: keyof typeof VerticalMap
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
    const {
      horizontal = 'right',
      vertical = 'center',
      title,
      label,
      help,
      required,
      errMsg
    } = this.props
    return (
      <Fragment>
        <div
          class={
            'col-span-4 flex h-full cursor-default select-none ' +
            HorizontalMap[horizontal] +
            ' ' +
            VerticalMap[vertical]
          }
        >
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
            <span class="ml-px text-sm text-red-400">*</span>
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
