'use strict';

const Vector = require('./vector');
const Object = require('./object');

class Tile extends Vector{
  constructor(grid, x, y, z){
    super(x, y, z);

    this.grid = grid;
    this.objs = [];

    this.has = O.obj();
  }

  get len(){ return this.objs.length; }
  get fst(){ return this.len !== 0 ? this.objs[0] : null; }
  get empty(){ return this.len === 0; }
  get sngl(){ return this.len === 1; }
  get mult(){ return this.len > 1; }

  addObj(obj){
    const {objs, has} = this;

    obj.index = objs.length;
    objs.push(obj);

    for(const trait in obj.is){
      if(trait in has) has[trait]++;
      else has[trait] = 1;
    }
  }

  removeObj(obj){
    const {objs, has} = this;
    const {index} = obj;
    const last = objs.pop();

    last.index = index;
    if(last !== obj) objs[index] = last;

    for(const trait in obj.is)
      has[trait]--;
  }

  purge(){
    const {objs} = this;
    const len = objs.length;

    for(let i = 0; i !== len; i++)
      objs[0].remove();
  }

  [Symbol.iterator](){ return this.objs[Symbol.iterator](); }
};

module.exports = Tile;