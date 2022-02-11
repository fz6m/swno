import { AbstractNode } from './internal'

describe('AbstractNode', () => {
  it('can print', () => {
    console.log(
      AbstractNode.from({
        today: {
          needCoffee: true,
          writeBlog: true,
        },
        tomorrow: {
          holiday: 'hopefully!',
          zenMode: {
            forever: true,
          },
        },
      }).print()
    )
  })
})
