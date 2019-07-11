'use strict';

const ALLOC_OFFSET = 100;
const ALLOC_SIZE = 400;

class WorldGenerator{
  constructor(realm, start, pset){
    this.realm = realm;
    this.grid = realm.grid;

    this.start = start;
    this.pset = pset;
  }

  gen(tile){ O.virtual('gen'); }

  allocate(tile, offset=ALLOC_OFFSET, size=ALLOC_SIZE){
    const {grid, generated, pset} = this;
    const path = new Set([tile]);

    for(let i = 0; i !== offset; i++){
      const next = tile.adj(grid.rand(tile.adjsNum));
      if(generated.has(next) || !pset.has(next)) continue;

      path.add(next);
      tile = next;
    }

    const visited = new Set();
    const queue = [tile];
    const queued = new Set(queue);
    const allocated = new Set();

    while(allocated.size < size){
      if(queue.length === 0) break;

      const tile = grid.randElem(queue, 1, 1);
      queued.delete(tile);
      visited.add(tile);
      allocated.add(tile);

      for(let j = 0; j !== tile.adjsNum; j++){
        const next = tile.adj(j);
        if(generated.has(next) || visited.has(next) || queued.has(next)) continue;
        if(!pset.has(next)) continue;

        queue.push(next);
        queued.add(next);
        allocated.add(next);
      }
    }

    for(const tile of path)
      allocated.add(tile);

    return [tile, allocated];
  }
}

module.exports = WorldGenerator;