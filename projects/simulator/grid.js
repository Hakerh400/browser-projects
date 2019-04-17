'use strict';

const Tile = require('./tile');
const Vector = require('./vector');

class Grid extends O.Map3D{
  constructor(){
    super();
  }

  init(x, y, z){
    const d = new Tile(this, x, y, z);
    this.set(x, y, z, d);
    return d;
  }
};

module.exports = Grid;