'use strict';

const WorldGeneratorBase = require('../../world-generator');
const cs = require('./ctors');

class WorldGenerator extends WorldGeneratorBase{
  constructor(realm, start, pset){
    super(realm, start, pset);

    this.generated = new Set([start]);
    new cs.Ground(start);
    new cs.Player(start);
  }

  generate(tile){
    const {grid, pset, generated} = this;
    const [start, allocated] = this.allocate(tile);

    const a = grid.rand(2);
    for(const tile of allocated){
      new cs.Ground(tile, a);
      generated.add(tile);
    }

    // new cs.Box(start);
  }
}

module.exports = WorldGenerator;