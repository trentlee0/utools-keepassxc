import { booleanProps } from '@/utils/common'
import { Component } from 'nano-jsx/lib/component'

export interface CheckboxProps {
  value?: boolean
  onClick?: (value: boolean) => void
}

export default class Checkbox extends Component<CheckboxProps> {
  render() {
    const { value } = this.props
    const inputProps = booleanProps({ hidden: !value })
    return (
      <div
        class="flex h-4 w-4 cursor-pointer overflow-hidden rounded bg-gray-200 dark:bg-gray-500"
        onClick={() => this.props.onClick?.(!value)}
      >
        <input
          class="h-full w-full cursor-pointer accent-blue-500 outline-none"
          type="checkbox"
          checked={value}
          {...inputProps}
        />
      </div>
    )
  }
}
