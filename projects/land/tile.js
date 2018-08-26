'use strict';

class Tile{
  constructor(adj){
    this.a = O.Color.from(O.hsv((adj.length & 7) / 8));
  }
};

module.exports = Tile;