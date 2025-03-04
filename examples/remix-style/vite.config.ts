import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import Pages from 'vite-plugin-pages2'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    Pages({ routeStyle: 'remix' }),
  ],
})
