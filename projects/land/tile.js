'use strict';

const structs = require('./structs');
const biomes = require('./biomes');

const stats = O.enum([
  'GENERATING',
  'READY',
  'DONE',
]);

class Tile{
  /*
    prev - Tile that requested generating this tile
    sti  - Index of the structure that performed the request
    dir  - Direction to the "prev" relative to this tile
  */

  constructor(prev, sti, dir){
    this.status = stats.GENERATING;

    this.structs = [];
    this.content = [];
    this.expandDirs = 0;

    this.update(prev, dir);
  }

  update(prev, sti, dir){
  }
};

Tile.stats = stats;

module.exports = Tile;