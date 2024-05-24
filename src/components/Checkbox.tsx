import { booleanProps } from '@/utils/common'
import { Component } from 'nano-jsx/lib/component'

export interface CheckboxProps {
  value?: boolean
  title?: string
  onClick?: (value: boolean) => void
}

export default class Checkbox extends Component<CheckboxProps> {
  render() {
    const { value, title } = this.props
    const inputProps = booleanProps({ hidden: !value })
    return (
      <div
        class="flex h-4 w-4 cursor-pointer overflow-hidden rounded bg-neutral-200 dark:bg-neutral-500"
        onClick={() => this.props.onClick?.(!value)}
        title={title}
      >
        <input
          class="h-full w-full cursor-pointer accent-green-600 outline-none"
          type="checkbox"
          checked={value}
          {...inputProps}
        />
      </div>
    )
  }
}
