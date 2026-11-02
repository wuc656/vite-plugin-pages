import { resolve } from 'node:path'

import { resolveOptions } from '../src/options'
import { countSlash, extsToGlob, isCatchAllRoute, isDynamicRoute, isTarget, slash } from '../src/utils'

describe('utils', () => {
  it('extensions to glob', () => {
    expect(extsToGlob(['vue', 'ts', 'js'])).toBe('{vue,ts,js}')
  })
  it('single extension to glob', () => {
    expect(extsToGlob(['vue'])).toBe('vue')
  })
  it('count slash', () => {
    expect(countSlash('route/path/nested')).toBe(2)
  })
  it('dynamic route', () => {
    expect(isDynamicRoute('[id]')).toBe(true)
    expect(isDynamicRoute('_id', true)).toBe(true)
    expect(isDynamicRoute('me')).toBe(false)
  })
  it('catch all route', () => {
    expect(isCatchAllRoute('[...all]')).toBe(true)
    expect(isCatchAllRoute('_', true)).toBe(true)
    expect(isCatchAllRoute('[id]')).toBe(false)
    expect(isCatchAllRoute('_id', true)).toBe(false)
  })
  it('path is target', () => {
    const options = resolveOptions({
      dirs: 'examples/vue/src/pages',
      resolver: 'vue',
      exclude: ['**/exclude/**'],
    })

    const testIsTarget = (path: string) => expect(isTarget(slash(resolve(path)), options))

    testIsTarget('examples/vue/src/pages/home.vue').toBe(true)
    testIsTarget('examples/vue/src/pages/nested/home.vue').toBe(true)
    testIsTarget('examples/vue/src/pages-backup/home.vue').toBe(false)
    testIsTarget('examples/vue/src/pages.vue').toBe(false)
    testIsTarget('examples/vue/src/pages/exclude/home.vue').toBe(false)
    testIsTarget('examples/vue/src/pages/home.txt').toBe(false)
  })
})
