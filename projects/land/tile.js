'use strict';

const structs = require('./structs');
const biomes = require('./biomes');

class Tile{
  constructor(x, y, adj1, adj2){
    var biome = new biomes.Meadow(1);
    this.structs = [biome];

    var k = Math.abs(O.randf(x / (y || 1))) + 1;
    this.a = O.Color.from(O.hsv(k % 1)).toString();
  }
};

module.exports = Tile;