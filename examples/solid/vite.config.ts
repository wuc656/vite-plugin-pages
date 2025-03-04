import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages2'
import solid from 'vite-plugin-solid'

export default defineConfig({
  plugins: [
    solid(),
    Pages({
      dirs: [
        { dir: resolve(__dirname, './src/pages'), baseRoute: '' },
        { dir: 'src/features/**/pages', baseRoute: 'features' },
        { dir: 'src/admin/pages', baseRoute: 'admin' },
      ],
      extensions: ['tsx', 'md'],
    }),
  ],
  build: {
    target: 'esnext',
  },
})
