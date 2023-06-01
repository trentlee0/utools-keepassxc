import { Fragment } from 'nano-jsx/lib/fragment'
import Setting from '@/views/Setting'
import Generator from '@/views/Generator'

export default function App(props: { code: string }) {
  return (
    <Fragment>
      <head>
        <title></title>
        <style>/* inject css replacing */</style>
        <script src="index.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <div id="app" class="px-5 py-1 dark:text-white">
          {props.code === 'keepass-generator' ? <Generator /> : <Setting />}
        </div>
      </body>
    </Fragment>
  )
}
