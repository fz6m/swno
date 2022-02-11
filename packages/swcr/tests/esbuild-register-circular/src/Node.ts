import { AbstractNode } from './internal'

export class Node extends AbstractNode {
  children: any

  constructor(parent: any, thing: any) {
    super(parent)
    this.children = {}
    Object.keys(thing).forEach((key) => {
      this.children[key] = AbstractNode.from(thing[key], this)
    })
  }

  print() {
    return (
      '\n' +
      Object.keys(this.children)
        .map(
          (key) =>
            `${''.padStart(this.getDepth() * 2)}${key}: ${this.children[
              key
            ].print()}`
        )
        .join('\n')
    )
  }
}
