import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['e2e/**/*.test.ts'],
    globals: true,
    pool: 'forks',
    isolate: false,
    fileParallelism: false,
  },
})
