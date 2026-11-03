import type { SFCBlock } from '@vue/compiler-sfc'
import { resolve } from 'node:path'
import { getRouteBlock, parseCustomBlock, parseYamlComment } from '../src/customBlock'
import { resolveOptions } from '../src/options'

const options = resolveOptions({})

describe('parser', () => {
  it('custom block', async () => {
    const path = resolve('./examples/vue/src/pages/blog/[id].vue')
    const routeBlock = await getRouteBlock(path, options)
    expect(routeBlock).toMatchSnapshot()
  })

  it('jsx yaml comment', async () => {
    const path = resolve('./examples/vue/src/pages/jsx.jsx')
    const routeBlock = await getRouteBlock(path, options)
    expect(routeBlock).toMatchSnapshot()
  })

  it('returns empty object for empty yaml route block', () => {
    const block = {
      type: 'route',
      content: '# comment only\n',
      lang: 'yaml',
      attrs: {},
      loc: {} as any,
    } satisfies SFCBlock
    expect(parseCustomBlock(block, 'test.vue', options)).toEqual({})
  })

  it('returns empty object for empty yaml jsx comment', () => {
    const parsed = [{
      value: ' route\n# comment: only\n',
      loc: { start: { line: 1 } },
    }]
    expect(parseYamlComment(parsed, 'test.jsx')).toEqual({})
  })
})
