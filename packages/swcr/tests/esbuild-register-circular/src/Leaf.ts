import { AbstractNode } from './internal'

export class Leaf extends AbstractNode {
  constructor(parent: any, private value: any) {
    super(parent)
  }

  print() {
    return this.value
  }
}
