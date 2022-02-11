import type { Config } from '@jest/types'

const config: Config.InitialOptions = {
  transform: {
    '^.+\\.tsx?$': 'esbuild-jest',
  },
}

export default config
