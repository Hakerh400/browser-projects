'use strict';

class Object{
  static traits = O.arr2obj([]);
  static layer = 0;

  is = this.constructor.traits;
  layer = this.constructor.layer;

  constructor(tile){
    this.tile = tile;

    tile.addObj(this);
  }
}

module.exports = Object;