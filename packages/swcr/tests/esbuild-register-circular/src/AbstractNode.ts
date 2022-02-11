import { Node, Leaf } from './internal'

export class AbstractNode {
  constructor(private parent: any) {
    this.parent = parent
  }

  getDepth() {
    if (this.parent) return this.parent.getDepth() + 1
    return 0
  }

  print() {
    throw 'abstract; not implemented'
  }

  static from(thing: any, parent?: any) {
    if (thing && typeof thing === 'object') return new Node(parent, thing)
    else return new Leaf(parent, thing)
  }
}
