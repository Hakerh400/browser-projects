'use strict';

const Vector = require('./vector');
const Object = require('./object');

class Tile extends Vector{
  constructor(grid, x, y, z){
    super(x, y, z);

    this.grid = grid;
    this.objs = [];
  }

  get len(){ return this.objs.length; }
  get fst(){ return this.len !== 0 ? this.objs[0] : null; }
  get empty(){ return this.len === 0; }
  get sngl(){ return this.len === 1; }

  addObj(obj){
    const {objs} = this;

    obj.index = objs.length;
    objs.push(obj);
  }

  removeObj(obj){
    const {objs} = this;
    const {index} = obj;
    const last = objs.pop();

    last.index = index;
    if(objs.length !== 0) objs[index] = last;
  }

  [Symbol.iterator](){ return this.objs[Symbol.iterator](); }
};

module.exports = Tile;