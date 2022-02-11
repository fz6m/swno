import { EModule } from './constants'

export type Compile = (
  code: string,
  filename: string,
  format?: EModule
) => string

export interface ILoadJsonResult {
  /**
   * file exist
   */
  exist: boolean
  /**
   * json
   */
  data?: Record<string, any>
  /**
   * file path
   */
  path?: string
}

export interface ITsconfig {
  jsxFactory?: string
  jsxFragment?: string
  target?: string
}
