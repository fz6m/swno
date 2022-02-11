import { endsWith, loadProjectJson } from './utils'

import type { JscTarget } from '@swc/core'
import { ITsconfig } from './interface'
import { EModule } from './constants'

export const getTsconfig = (cwd: string): ITsconfig => {
  const { data, exist } = loadProjectJson('tsconfig.json', cwd)
  if (exist && data) {
    return {
      jsxFactory: data.compilerOptions?.jsxFactory,
      jsxFragment: data.compilerOptions?.jsxFragmentFactory,
      target: data.compilerOptions?.target?.toLowerCase(),
    }
  }
  return {}
}

export const getFormat = ({
  filename,
  cwd,
}: {
  filename: string
  cwd: string
}) => {
  // via file ext
  if (endsWith(filename, '.mjs')) {
    return EModule.esm
  }

  if (endsWith(filename, '.cjs')) {
    return EModule.cjs
  }

  // via package.json
  const { exist, data = {} } = loadProjectJson('package.json', cwd)
  if (exist && data.type === 'module') {
    return EModule.esm
  }

  return EModule.cjs
}

/**
 * tsconfig.json > target
 * @docs https://www.typescriptlang.org/tsconfig#target
 *
 * => swcrc target
 * @type {JscTarget}
 */
export const getTarget = (target: string = 'es2016' /** es7 */): JscTarget => {
  if (target === 'es6') {
    return 'es2015'
  }
  if (target === 'esnext') {
    return 'es2022'
  }

  return target as JscTarget
}
