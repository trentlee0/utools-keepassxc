import { booleanProps } from '@/utils/common'
import { Component } from 'nano-jsx/lib/component'
import Icon from './Icon'

export enum SizeMap {
  small = 'text-sm',
  medium = 'text-base',
  large = 'text-lg'
}

export interface TextFieldProps {
  value?: string
  icon?: string
  autofocus?: boolean
  placeholder?: string
  label?: string
  type?: string
  disabled?: boolean
  readonly?: boolean
  appendIcon?: string
  appendIconTitle?: string
  size?: keyof typeof SizeMap

  ref?: (el: TextField) => void
  onInput?: (value: string, event: Event) => void
  onChange?: (value: string, event: Event) => void
  onBlur?: (value: string, event: Event) => void
  onAppendClick?: (e: Event) => void
}

export default class TextField extends Component<TextFieldProps> {
  private inputRef: HTMLInputElement | null = null

  constructor(props: TextFieldProps) {
    super(props)
  }

  handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.props.onInput?.(value, e)
  }

  handleChange(e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.props.onChange?.(value, e)
  }

  handleBlur(e: Event) {
    const value = (e.target as HTMLInputElement).value
    this.props.onBlur?.(value, e)
  }

  focus() {
    this.inputRef?.focus()
  }

  selectText() {
    const el = this.inputRef
    if (el) {
      el.selectionStart = 0
      el.selectionEnd = el.value.length
    }
  }

  render() {
    const {
      value,
      icon,
      autofocus = false,
      label,
      type = 'text',
      disabled = false,
      placeholder,
      readonly = false,
      size = 'medium',
      appendIcon,
      appendIconTitle
    } = this.props

    this.props.ref?.(this)

    const inputProps = booleanProps({ autofocus, disabled, readonly })
    return (
      <div class="flex h-[30px] w-full items-center">
        {label ? <label class="mr-2 flex-none">{label}</label> : null}
        <div
          class={
            'flex w-full items-center rounded-md border bg-transparent px-3 py-1 transition focus-within:border-gray-500 dark:focus-within:border-gray-400 ' +
            (disabled
              ? 'cursor-default border-gray-100 dark:border-stone-700 '
              : 'cursor-text border-gray-300 dark:border-stone-600 ') +
            SizeMap[size]
          }
          onClick={() => this.inputRef?.focus()}
        >
          {icon ? (
            <div class="mr-2">
              <Icon path={icon} size="default"></Icon>
            </div>
          ) : null}

          <input
            ref={(el: HTMLInputElement) => (this.inputRef = el)}
            class="w-full bg-transparent outline-none"
            type={type}
            value={value}
            placeholder={placeholder}
            {...inputProps}
            onInput={(e: Event) => this.handleInput(e)}
            onChange={(e: Event) => this.handleChange(e)}
            onBlur={this.handleBlur.bind(this)}
          />

          {appendIcon ? (
            <div
              class={
                'ml-2 flex items-center ' +
                (this.props.onAppendClick ? 'cursor-pointer' : 'cursor-text')
              }
              title={appendIconTitle}
              onClick={(e: Event) => this.props.onAppendClick?.(e)}
            >
              <Icon path={appendIcon} size="x-small"></Icon>
            </div>
          ) : null}
        </div>
      </div>
    )
  }
}
