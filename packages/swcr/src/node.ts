import fs from 'fs'
import { dirname } from 'path'
import module from 'module'

import sourceMapSupport from 'source-map-support'
import type { UrlAndMap } from 'source-map-support'
import type { RawSourceMap } from 'source-map'
import { addHook } from 'pirates'
import type { Config as SwcConfig } from '@swc/core'
import { transformSync } from '@swc/core'
import process from 'process'

import { getFormat, getTarget, getTsconfig } from './options'
import { endsWith, removeNodePrefix } from './utils'
import { registerTsconfigPaths } from './tsconfig-paths'

import { Compile } from './interface'
import { DEFAULT_EXTENSIONS, EModule } from './constants'
import { isDegrade } from './degrade/mjs'

const map: { [file: string]: string | RawSourceMap } = {}

function installSourceMapSupport() {
  /**
   * @pr https://github.com/egoist/esbuild-register/pull/64
   * @commit https://github.com/egoist/esbuild-register/commit/e41493714fc89f8f67c5f44401aecd3ee6b6867a
   * @docs https://nodejs.org/api/process.html#processsetsourcemapsenabledval
   */
  if ((process as any).setSourceMapsEnabled) {
    ;(process as any).setSourceMapsEnabled(true)
  } else {
    sourceMapSupport.install({
      handleUncaughtExceptions: false,
      environment: 'node',
      retrieveSourceMap(file) {
        if (map[file]) {
          return {
            url: file,
            map: map[file],
          } as UrlAndMap
        }
        return null
      },
    })
  }
}

/**
 * Patch the Node CJS loader to suppress the ESM error
 * https://github.com/nodejs/node/blob/069b5df/lib/internal/modules/cjs/loader.js#L1125
 *
 * As per https://github.com/standard-things/esm/issues/868#issuecomment-594480715
 */
function patchCommonJsLoader(compile: Compile) {
  // @ts-expect-error
  const extensions = module.Module._extensions
  const jsHandler = extensions['.js']
  const mjsHandler = extensions['.mjs']

  extensions['.js'] = function (module: any, filename: string) {
    try {
      return jsHandler.call(this, module, filename)
    } catch (error: any) {
      if (error.code !== 'ERR_REQUIRE_ESM') {
        throw error
      }

      let content = fs.readFileSync(filename, 'utf8')
      content = compile(content, filename, EModule.cjs)
      module._compile(content, filename)
    }
  }

  extensions['.mjs'] = function (module: any, filename: string) {
    try {
      return mjsHandler.call(this, module, filename)
    } catch (error: any) {
      if (isDegrade(filename)) {
        let content = fs.readFileSync(filename, 'utf8')
        content = compile(content, filename, EModule.cjs)
        module._compile(content, filename)
        return
      }

      throw error
    }
  }
}

export interface IRegisterOptions extends SwcConfig {
  extensions?: string[]
  /**
   * Auto-ignore node_modules. Independent of any matcher.
   * @default true
   */
  hookIgnoreNodeModules?: boolean
  /**
   * A matcher function, will be called with path to a file. Should return truthy if the file should be hooked, falsy otherwise.
   */
  hookMatcher?: (fileName: string) => boolean
}

export function register(opts: IRegisterOptions = {}) {
  const {
    extensions = DEFAULT_EXTENSIONS,
    hookIgnoreNodeModules = true,
    hookMatcher,
    ...swcOverrideConfig
  } = opts

  const compile: Compile = function compile(code, filename, format) {
    const dir = dirname(filename)
    const tsconfig = getTsconfig(dir)

    const type = format || getFormat({ filename, cwd: dir })
    const target = getTarget(tsconfig.target)

    const isTsx = endsWith(filename, '.tsx')
    const isJsx = endsWith(filename, '.jsx')
    const isTs = endsWith(filename, '.ts') || isTsx

    const result = transformSync(code, {
      filename,
      sourceMaps: true,

      // swcrc
      module: {
        // @ts-ignore
        type: type,
        ignoreDynamic: true,
      },
      jsc: {
        parser: {
          syntax: isTs ? 'typescript' : 'ecmascript',
          ...(isTsx ? { tsx: true } : isJsx ? { jsx: true } : {}),
          dynamicImport: true,
          decorators: true,
        },
        /**
         * https://github.com/swc-project/swc/issues/4048
         */
        loose: false,
        target: target,
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
          react: {
            runtime: 'automatic',
            throwIfNamespace: true,
            useBuiltins: true,
            development: true,
            pragma: tsconfig.jsxFactory,
            pragmaFrag: tsconfig.jsxFragment,
          },
        },
      },

      // override
      ...(swcOverrideConfig || {}),
    })

    const js = result.code

    if (result.map) {
      map[filename] = result.map
    }

    if (format === EModule.esm) {
      return js
    }
    return removeNodePrefix(js)
  }

  const revert = addHook(compile, {
    exts: extensions,
    ignoreNodeModules: hookIgnoreNodeModules,
    matcher: hookMatcher,
  })

  installSourceMapSupport()
  patchCommonJsLoader(compile)

  const unregisterTsconfigPaths = registerTsconfigPaths()

  return {
    unregister() {
      revert()
      unregisterTsconfigPaths()
    },
  }
}

export type Register = ReturnType<typeof register>
