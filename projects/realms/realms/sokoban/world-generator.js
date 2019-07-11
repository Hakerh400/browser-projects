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

    const map = new Map();

    for(const tile of allocated){
      generated.add(tile);

      const obj = O.obj();
      map.set(tile, obj);

      obj.boxInit = O.rand(20) === 0;
      obj.box = obj.boxInit;
      obj.visited = tile === start;
    }

    const pathLen = allocated.size * 2;
    tile = start;

    for(let i = 0; i !== pathLen; i++){
      const obj = map.get(tile);

      const dir = grid.rand(tile.adjsNum);
      const next = tile.adjRaw(dir);
      if(!allocated.has(next)) continue;

      const objNext = map.get(next);

      if(!objNext.box){
        objNext.visited = 1;
        tile = next;
        continue;
      }

      const nextNext = next.adjRaw(dir);
      if(!allocated.has(nextNext)) continue;

      const objNextNext = map.get(nextNext);
      if(nextNext.box) continue;

      objNext.box = 0;
      objNextNext.box = 1;
      objNext.visited = 1;
      objNextNext.visited = 1;
      tile = next;
    }

    for(const tile of allocated){
      const obj = map.get(tile);

      if(!obj.visited){
        new cs.Ground(tile);
        new cs.Wall(tile);
        continue;
      }

      new cs.Ground(tile, obj.box);
      if(obj.boxInit) new cs.Box(tile);
    }
  }
}

module.exports = WorldGenerator;