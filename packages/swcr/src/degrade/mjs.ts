const REGS = [/zx\/(.+)\.mjs$/]
export const isDegrade = (filename: string) => {
  return REGS.some((reg) => {
    return reg.test(filename)
  })
}
