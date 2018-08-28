'use strict';

const structs = require('./structs');
const biomes = require('./biomes');

class Tile{
  constructor(adj1, adj2){
    var biome = new biomes.Meadow(1);
    this.structs = [biome];

    this.a = O.Color.from(O.hsv(adj2.length / 11)).toString();
  }
};

module.exports = Tile;