import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  // tsup's bundled rollup-plugin-dts crashes on Node 26 while resolving
  // declarations. Generate declarations with TypeScript in the build script.
  dts: false,
  clean: true,
  sourcemap: true,
})
