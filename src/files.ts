import type { PageOptions, ResolvedOptions } from './types'
import { join } from 'node:path'
import { globSync } from 'tinyglobby'

import { getPagePattern, slash } from './utils'

/**
 * Resolves the page dirs for its for its given globs
 */
const VUE_MD_EXT_RE = /\/$/
export function getPageDirs(PageOptions: PageOptions, root: string, exclude: string[]): PageOptions[] {
  const dirs = globSync(slash(PageOptions.dir), {
    ignore: exclude,
    onlyDirectories: true,
    dot: true,
    expandDirectories: false,
    cwd: root,
  })

  const pageDirs = dirs.map(dir => ({
    ...PageOptions,
    dir: dir.replace(VUE_MD_EXT_RE, ''),
  }))

  return pageDirs
}

/**
 * Resolves the files that are valid pages for the given context.
 */
export function getPageFiles(path: string, options: ResolvedOptions, pageOptions?: PageOptions): string[] {
  const files = globSync(getPagePattern(options, pageOptions), {
    ignore: options.exclude,
    onlyFiles: true,
    cwd: path,
  }).map(p => slash(join(path, p)))

  return files
}
