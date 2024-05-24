import { booleanProps } from '@/utils/common'
import { Component } from 'nano-jsx/lib/component'

export interface SelectOption {
  value: string
  text: string
}

export interface SelectProps {
  value: string
  disabled?: boolean
  options: SelectOption[]

  onInput?: (value: string, event: Event) => void
  onChange?: (value: string, event: Event) => void
  onBlur?: (value: string, event: Event) => void
}

export default class Select extends Component<SelectProps> {
  constructor(props: SelectProps) {
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
    const { value, options, disabled = false } = this.props
    const inputProps = booleanProps({ disabled })
    return (
      <select
        class={
          'rounded-md px-2 py-1 outline-none ' +
          (disabled
            ? 'bg-transparent'
            : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-700 dark:hover:bg-neutral-600')
        }
        {...inputProps}
        onInput={(e: Event) => this.handleInput(e)}
        onChange={(e: Event) => this.handleChange(e)}
        onBlur={this.handleBlur.bind(this)}
      >
        {options.map((option) => (
          <option
            {...booleanProps({ selected: option.value === value })}
            value={option.value}
          >
            {option.text}
          </option>
        ))}
      </select>
    )
  }
}
