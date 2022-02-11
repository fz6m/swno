import path from 'path'
import fs from 'fs'

import stripJsonComments from 'strip-json-comments'
import { sync as findUpSync } from 'find-up'

import { ILoadJsonResult } from './interface'

const nodeVersion = (process.versions.node.match(/^(\d+)\.(\d+)/) || [])
  .slice(1)
  .map(Number)

// Use a simple regexp to replace `node:id` with `id` from source code
export function removeNodePrefix(code: string) {
  if (nodeVersion[0] <= 14 && nodeVersion[1] < 18) {
    return code.replace(
      /([\b\(])require\("node:([^"]+)"\)([\b\)])/g,
      '$1require("$2")$3'
    )
  }
  return code
}

export function jsoncParse(data: string) {
  try {
    return new Function('return ' + stripJsonComments(data).trim())()
  } catch (_) {
    // Silently ignore any error
    // That's what tsc/jsonc-parser did after all
    return {}
  }
}

export const endsWith = (filename: string, ext: string) => {
  return filename.endsWith(ext)
}

export const loadProjectJson = (
  filename: string,
  currentPath: string
): ILoadJsonResult => {
  const rootPath = findUpSync('package.json', { cwd: currentPath })
  if (!rootPath) {
    return { exist: false }
  }
  const filePath = path.join(rootPath, '../', filename)
  const isExist = fs.existsSync(filePath)

  let data: Record<string, any> = {}
  if (isExist) {
    const content = fs.readFileSync(filePath, 'utf-8')
    data = jsoncParse(content)
  }

  return { exist: isExist, data, path: filePath }
}
