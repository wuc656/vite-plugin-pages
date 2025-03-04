import VuePlugin from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages2'

const config = defineConfig({
  plugins: [
    VuePlugin(),
    Pages(),
  ],
  build: {
    minify: false,
  },
})

export default config
