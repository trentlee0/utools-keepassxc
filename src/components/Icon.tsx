import { Component } from 'nano-jsx/lib/component'

export enum SizeMap {
  'x-small' = 16,
  'small' = 20,
  'default' = 24,
  'large' = 28,
  'x-large' = 36
}

export interface IconProps {
  path: string
  size?: keyof typeof SizeMap | number
  viewbox?: string
  color?: string
}

export default class Icon extends Component<IconProps> {
  getSize(size: keyof typeof SizeMap | number) {
    if (typeof size === 'number') {
      return size
    }
    return SizeMap[size]
  }

  render() {
    const { path, size = 'default', viewbox = '0 0 24 24', color } = this.props
    return (
      <svg
        width={this.getSize(size)}
        height={this.getSize(size)}
        viewBox={viewbox}
        style={`color: ${color}`}
      >
        <path d={path} class="fill-current"></path>
      </svg>
    )
  }
}
