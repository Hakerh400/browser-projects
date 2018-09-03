'use strict';

const structs = require('./structs');
const biomes = require('./biomes');

const stats = O.enum([
  'GENERATING',
  'READY',
  'DONE',
]);

class Tile{
  constructor(grid, x, y){
    var adj = [];

    grid.adj(x, y, (x, y, d) => {
      adj.push(d);
    });

    this.status = stats.GENERATING;
    this.structs = [];
    this.content = [];

    var k = adj.filter(a => a !== null).length / 5;
    this.a = O.Color.from(O.hsv(k % 1)).toString();
  }
};

Tile.stats = stats;

module.exports = Tile;