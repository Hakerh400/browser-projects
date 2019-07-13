'use strict';

const WorldGeneratorBase = require('../../world-generator');
const cs = require('./ctors');

const {DigitType} = cs.Ground;

class WorldGenerator extends WorldGeneratorBase{
  constructor(realm, start, pset){
    super(realm, start, pset);
  }

  gen(tile){
    const {grid, first} = this;
    const set = this.allocRect(tile, 11, 11);

    for(const tile of set){
      new cs.Ground(tile, grid.rand(4), grid.rand(9) + 1);
    }
  }
}

module.exports = WorldGenerator;