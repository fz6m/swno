const REGS = [/zx\/(.+)\.mjs$/]

/**
 * only for zx@^5
 */
export const isDegrade = (filename: string) => {
  return REGS.some((reg) => {
    return reg.test(filename)
  })
}
