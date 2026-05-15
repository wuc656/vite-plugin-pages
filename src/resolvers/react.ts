import type { PageContext } from '../context'
import type { Optional, PageResolver, ResolvedOptions } from '../types'

import { generateClientCode } from '../stringify'
import {
  buildReactRemixRoutePath,
  buildReactRoutePath,
  countSlash,
  normalizeCase,
} from '../utils'

export interface ReactRouteBase {
  caseSensitive?: boolean
  children?: ReactRouteBase[]
  element?: string
  index?: boolean
  path?: string
  rawRoute: string
}

export interface ReactRoute extends Omit<Optional<ReactRouteBase, 'rawRoute' | 'path'>, 'children'> {
  children?: ReactRoute[]
}
const VUE_MD_EXT_RE = /^\//

/**
 * Sort child routes so React Router matches in correct priority order.
 * React Router v6+ matches routes in array order (first-match-wins),
 * so more specific routes must come before less specific ones.
 *
 * Priority (lowest weight first):
 *   0 — index route  (path "/")
 *   1 — static route  (e.g. "about", "blog/today")
 *   2 — dynamic route (e.g. ":id")
 *   3 — catch-all     (path "*")
 */
function sortReactRoutes(routes: ReactRouteBase[]): ReactRouteBase[] {
  routes.sort((a, b) => {
    const weight = (r: ReactRouteBase): number => {
      const p = r.path ?? ''
      if (p === '/')
        return 0
      if (p === '*')
        return 3
      if (p.startsWith(':'))
        return 2
      return 1
    }
    return weight(a) - weight(b)
  })
  for (const route of routes) {
    if (route.children)
      sortReactRoutes(route.children)
  }
  return routes
}

function prepareRoutes(
  routes: ReactRoute[],
  options: ResolvedOptions,
  parent?: ReactRoute,
) {
  for (const route of routes) {
    if (parent)
      route.path = route.path?.replace(VUE_MD_EXT_RE, '')

    if (route.children)
      route.children = prepareRoutes(route.children, options, route)

    delete route.rawRoute

    Object.assign(route, options.extendRoute?.(route, parent) || {})
  }

  return routes
}

async function computeReactRoutes(ctx: PageContext): Promise<ReactRoute[]> {
  const { routeStyle, caseSensitive, importPath } = ctx.options
  const nuxtStyle = routeStyle === 'nuxt'

  const pageRoutes = [...ctx.pageRouteMap.values()]
    // sort routes for HMR
    .sort((a, b) => countSlash(a.route) - countSlash(b.route))

  const routes: ReactRouteBase[] = []

  pageRoutes.forEach((page) => {
    const pathNodes = page.route.split('/')
    const element = importPath === 'relative' ? page.path.replace(ctx.root, '') : page.path
    let parentRoutes = routes

    for (let i = 0; i < pathNodes.length; i++) {
      const node = pathNodes[i]

      const route: ReactRouteBase = {
        caseSensitive,
        path: '',
        rawRoute: pathNodes.slice(0, i + 1).join('/'),
      }

      if (i === pathNodes.length - 1)
        route.element = element

      const isIndexRoute = normalizeCase(node, caseSensitive).endsWith('index')

      if (!route.path && isIndexRoute) {
        route.path = '/'
      }
      else if (!isIndexRoute) {
        if (routeStyle === 'remix')
          route.path = buildReactRemixRoutePath(node)
        else
          route.path = buildReactRoutePath(node, nuxtStyle)
      }

      // Check parent exits
      const parent = parentRoutes.find((parent) => {
        return pathNodes.slice(0, i).join('/') === parent.rawRoute
      })

      if (parent) {
        // Make sure children exits in parent
        parent.children = parent.children || []
        // Append to parent's children
        parentRoutes = parent.children
      }

      const exits = parentRoutes.some((parent) => {
        return pathNodes.slice(0, i + 1).join('/') === parent.rawRoute
      })
      if (!exits)
        parentRoutes.push(route)
    }
  })

  // sort children so static routes come before dynamic/catch-all routes
  sortReactRoutes(routes)

  // sort by dynamic routes
  let finalRoutes = prepareRoutes(routes, ctx.options)

  finalRoutes = (await ctx.options.onRoutesGenerated?.(finalRoutes)) || finalRoutes

  return finalRoutes
}

async function resolveReactRoutes(ctx: PageContext) {
  const finalRoutes = await computeReactRoutes(ctx)
  let client = generateClientCode(finalRoutes, ctx.options)
  client = (await ctx.options.onClientGenerated?.(client)) || client
  return client
}

export function reactResolver(): PageResolver {
  return {
    resolveModuleIds() {
      return ['~react-pages', 'virtual:generated-pages-react']
    },
    resolveExtensions() {
      return ['tsx', 'jsx', 'ts', 'js']
    },
    async resolveRoutes(ctx) {
      return resolveReactRoutes(ctx)
    },
    async getComputedRoutes(ctx) {
      return computeReactRoutes(ctx)
    },
    stringify: {
      component: path => `React.createElement(${path})`,
      dynamicImport: path => `React.lazy(() => import("${path}"))`,
      final: code => `import React from "react";\n${code}`,
    },
  }
}
