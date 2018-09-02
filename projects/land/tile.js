'use strict';

const structs = require('./structs');
const biomes = require('./biomes');

const stats = O.enum([
]);

class Tile{
  constructor(adj){
    var k = O.randf(1);
    this.a = O.Color.from(O.hsv(k % 1)).toString();
  }
};

Tile.stats = stats;

module.exports = Tile;