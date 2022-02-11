import { AbstractNode } from './internal'

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
