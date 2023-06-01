import { defineConfig } from 'vite'
import { resolve } from 'path'
import injectCssToFile from 'vite-plugin-inject-css-to-file'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    injectCssToFile({
      fileNames: 'main.js',
      replacing: '/* inject css replacing */'
    })
  ],
  build: {
    minify: false,
    rollupOptions: {
      external: [/^node:/],
      input: {
        main: './src/main.ts',
        preload: './src/preload.ts'
      },
      output: {
        format: 'cjs',
        entryFileNames: '[name].js'
      }
    }
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      }
    ]
  }
})
