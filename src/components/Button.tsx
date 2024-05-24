import { Component } from 'nano-jsx/lib/component'

export enum ButtonType {
  small = ' rounded-md',
  normal = 'py-1 px-3 rounded-md',
  circle = 'p-2 rounded-full',
  float = 'p-2 rounded-full fixed right-8 bottom-6'
}

export interface ButtonProps {
  class?: string
  type?: keyof typeof ButtonType
  children?: Array<Component> | string

  onClick?: (e: Event) => void
}

export default class Button extends Component<ButtonProps> {
  render() {
    const { type = 'normal', children } = this.props
    return (
      <button
        class={
          `select-none opacity-100 outline-none transition duration-200 hover:opacity-90 ${ButtonType[type]} ` +
          this.props.class
        }
        onClick={(e: Event) => this.props.onClick?.(e)}
      >
        {children}
      </button>
    )
  }
}
