'use strict';

const Node = require('./node');

class Tree{
  constructor(){
    const a0 = () => new Node(0, a1, a0);
    const a1 = () => new Node(1, a0, a1);

    this.root = a1();
  }

  get(id, depth){
    let node = this.root;

    while(depth--){
      id *= 2;
      node = node.get(id & 1);
    }

    return node.val;
  }
}

module.exports = Tree;