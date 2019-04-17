'use strict';

const Object = require('./object');

const {layersNum} = Object;

class Layer{
  constructor(tile, index){
    this.tile = tile;
    this.index = index;

    this.objs = [];
  }

  get len(){ return this.objs.length; }

  get opaque(){ return objs.some(obj => obj.opaque); }
  get transparent(){ return objs.every(obj => obj.transparent); }

  get free(){ return this.len === 0 || objs[0].stackable; }
  get occupied(){ return this.len !== 0 && objs[0].blocking; }

  [Symbol.iterator](){ return this.objs[Symbol.iterator](); }

  addObj(obj){
    this.objs.push(obj);
  }
};

module.exports = Layer;