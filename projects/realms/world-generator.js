'use strict';

class WorldGenerator{
  #set = null;
  #allocating = 0;

  constructor(realm, start, pset){
    this.realm = realm;
    this.grid = realm.grid;

    this.start = start;
    this.pset = pset;

    this.generated = new Set();
    this.first = 1;
  }

  defaultTile(tile){}
  gen(tile){ O.virtual('gen'); }

  get size(){ return this.#set.size; }

  prepare(tile=null){
    this.#set = new Set();
    this.#allocating = 1;
    if(tile !== null) this.add(tile);
  }

  add(tile){
    this.generated.add(tile);
    this.#set.add(tile);
  }

  adj(tile, dir){
    if(!this.#allocating)
      return tile.adjRaw(dir);

    const adj = tile.adj(dir);

    if(!this.pset.has(adj)) return null;
    if(this.#set.has(adj)) return adj;
    if(this.generated.has(adj)) return null;

    return adj;
  }

  randAdj(tile){
    return this.adj(tile, this.grid.rand(tile.adjsNum))
  }

  getTiles(){
    const set = this.#set;

    this.#set = null;
    this.#allocating = 0;

    return set;
  }

  allocPath(tile, len){
    const {grid} = this;
    this.prepare(tile);

    for(let i = 0; i !== len; i++){
      const next = this.randAdj(tile);
      if(next === null) continue;

      this.add(next);
      tile = next;
    }

    return this.getTiles();
  }

  allocIsland(tile, size){
    const {grid} = this;
    this.prepare();
    
    const visited = new Set();
    const queue = [tile];
    const queued = new Set(queue);

    this.add(tile);

    while(this.size < size){
      if(queue.length === 0) break;

      const tile = grid.randElem(queue, 1, 1);
      queued.delete(tile);
      visited.add(tile);

      for(let j = 0; j !== tile.adjsNum; j++){
        const next = this.adj(tile, j);
        if(next === null || visited.has(next) || queued.has(next)) continue;

        queue.push(next);
        queued.add(next);
        this.add(next);
      }
    }

    return this.getTiles();
  }

  allocRect(tile, w, h){
    const {grid} = this;
    this.prepare();

    const w1 = w >> 1;
    const h1 = h >> 1;
    const w2 = w - w1 - 1;
    const h2 = h - h1 - 1;

    const row = tile => {
      let tile1 = tile;
      this.add(tile1);

      for(let x = 0; x !== w1; x++){
        tile1 = this.adj(tile1, 3);
        if(tile1 === null) break;
        this.add(tile1);
      }

      tile1 = tile;

      for(let x = 0; x !== w2; x++){
        tile1 = this.adj(tile1, 1);
        if(tile1 === null) break;
        this.add(tile1);
      }
    };

    let tile1 = tile;
    row(tile1);

    for(let y = 0; y !== h1; y++){
      tile1 = this.adj(tile1, 0);
      if(tile1 === null) break;
      row(tile1);
    }

    tile1 = tile;

    for(let y = 0; y !== h2; y++){
      tile1 = this.adj(tile1, 2);
      if(tile1 === null) break;
      row(tile1);
    }

    return this.getTiles();
  }
}

module.exports = WorldGenerator;