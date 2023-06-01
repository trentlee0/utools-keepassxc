import { Component } from 'nano-jsx/lib/component'
import FormItem from './FormItem'

export interface FormProps {
  onSubmit?: (e: Event) => void
  children: Array<FormItem>
}

export default class Form extends Component<FormProps> {
  constructor(props: FormProps) {
    super(props)
  }

  render() {
    return (
      <form onSubmit={(e: Event) => this.props.onSubmit?.(e)}>
        <div class="mt-5 grid w-full grid-cols-12 items-center gap-x-5 gap-y-6">
          {this.props.children}
        </div>
      </form>
    )
  }
}
