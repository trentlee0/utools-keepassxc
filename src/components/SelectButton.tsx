import Button, { ButtonType } from './Button'

export default function SelectButton(props: {
  children: string
  selected?: boolean
  type?: keyof typeof ButtonType
  onClick?: (v: boolean) => void
}) {
  return (
    <Button
      type={props.type}
      class={
        'mr-2 px-2 py-1 ' +
        (props.selected
          ? 'bg-green-600 text-white'
          : 'bg-neutral-200 text-black')
      }
      onClick={() => props.onClick?.(!props.selected)}
    >
      {props.children}
    </Button>
  )
}
