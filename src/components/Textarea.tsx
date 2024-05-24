import { booleanProps } from '@/utils/common'
import { Component } from 'nano-jsx/lib/component'

export interface TextareaProps {
  value?: string
  placeholder?: string
  label?: string
  type?: string
  disabled?: boolean
  readonly?: boolean

  onInput?: (value: string, event: Event) => void
  onChange?: (value: string, event: Event) => void
  onBlur?: (value: string, event: Event) => void
}

export default class Textarea extends Component<TextareaProps> {
  private inputRef: HTMLInputElement | null = null

  constructor(props: TextareaProps) {
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

  render() {
    const {
      value,
      disabled = false,
      placeholder,
      readonly = false
    } = this.props

    const inputProps = booleanProps({ disabled, readonly })
    return (
      <div class="flex w-full items-center">
        <div
          class={
            'flex w-full items-center rounded-md border bg-transparent transition focus-within:border-gray-500 dark:focus-within:border-gray-400 ' +
            (disabled
              ? 'cursor-default border-gray-100 dark:border-stone-700 '
              : 'cursor-text border-gray-300 dark:border-stone-600 ')
          }
          onClick={() => this.inputRef?.focus()}
        >
          <textarea
            ref={(el: HTMLInputElement) => (this.inputRef = el)}
            {...inputProps}
            placeholder={placeholder}
            class="w-full cursor-text border-gray-300 bg-transparent px-3 py-1 outline-none dark:border-stone-600"
            onInput={(e: Event) => this.handleInput(e)}
            onChange={(e: Event) => this.handleChange(e)}
            onBlur={this.handleBlur.bind(this)}
          >
            {value}
          </textarea>
        </div>
      </div>
    )
  }
}
