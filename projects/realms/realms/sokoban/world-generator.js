'use strict';

const WorldGeneratorBase = require('../../world-generator');
const cs = require('./ctors');

class WorldGenerator extends WorldGeneratorBase{
  constructor(realm, start, pset){
    super(realm, start, pset);

    this.generated = new Set();
    this.first = 1;
  }

  gen(tile){
    const {grid, pset, generated, first} = this;
    const [start, allocated] = this.allocate(tile, 0);

    const map = new Map();

    for(const tile of allocated){
      const isFirst = tile === start;
      generated.add(tile);

      const obj = O.obj();
      map.set(tile, obj);

      obj.boxInit = !isFirst && O.rand(20) === 0;
      obj.box = obj.boxInit;
      obj.visited = isFirst;
    }

    const pathLen = allocated.size * 4;
    let pushed = 0;
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
      if(!allocated.has(nextNext) || nextNext === start) continue;

      const objNextNext = map.get(nextNext);
      if(objNextNext.box) continue;

      objNext.box = 0;
      objNextNext.box = 1;
      objNext.visited = 1;
      objNextNext.visited = 1;
      tile = next;
      pushed = 1;
    }

    if(first) new cs.Player(start);

    for(const tile of allocated){
      const obj = map.get(tile);

      if(!(first && tile === start || pushed && obj.visited)){
        new cs.Ground(tile);
        new cs.Wall(tile);
        continue;
      }

      new cs.Ground(tile, obj.box);
      if(obj.boxInit) new cs.Box(tile);
    }

    if(first) this.first = 0;
  }
}

module.exports = WorldGenerator;