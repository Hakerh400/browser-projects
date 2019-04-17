'use strict';

const Object = require('./object');

const {layersNum} = Object;

class Layer{
  constructor(tile, index){
    this.tile = tile;
    this.index = index;

    this.objs = new Set();
  }

  get first(){ return O.first(this.objs); }
  get len(){ return this.objs.size; }

  get opaque(){ for(const obj of objs) if(obj.opaque) return 1; return 0; }
  get transparent(){ for(const obj of objs) if(obj.opaque) return 0; return 1; }

  get free(){ return this.len === 0 || this.first.stackable; }
  get occupied(){ return this.len !== 0 && this.first.blocking; }

  

  addObj(obj){
    this.objs.add(obj);
  }

  removeObj(obj){
    this.objs.delete(obj);
  }
};

module.exports = Layer;