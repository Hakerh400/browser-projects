'use strict';

const Node = require('./node');

class Tree{
  constructor(){
    const left = a => {
      const b = new Uint8ClampedArray(a);
      b[0] = (b[0] + 255) / 2;
      b[1] = (b[0] + b[2]) / 2;
      b[2] = (b[0] + b[1]) / 3;
      return new Node(b, () => left(b), () => right(b));
    };

    const right = a => {
      const b = new Uint8ClampedArray(a);
      b[0] += 10;
      b[1] += 50;
      b[2] += 100;
      return new Node(b, () => left(b), () => right(b));
    };

    const col = new Uint8ClampedArray([0, 0, 0]);
    this.root = new Node(col, () => left(col), () => right(col));
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