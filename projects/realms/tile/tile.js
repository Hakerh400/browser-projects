'use strict';

class Tile{
  adjs = O.ca(this.adjsNum, () => null);
  objs = new Set();
  has = O.obj();

  constructor(grid, gravDir){
    this.grid = grid;
    this.gravDir = gravDir;
  }

  get adjsNum(){ O.virtual('adjsNum'); }
  draw(g, t, k){ O.virtual('draw'); }
  border(g){ O.virtual('border'); }
  invDir(dir){ O.virtual('invDir'); }
  gen(){ O.virtual('gen'); }

  get len(){ return this.objs.size; }
  get fst(){ return O.fst(this.objs); }
  get empty(){ return this.objs.size === 0; }
  get nempty(){ return this.objs.size !== 0; }
  get sngl(){ return this.objs.size === 1; }
  get mult(){ return this.objs.size > 1; }
  get free(){ return !this.has.occupying; }
  get nfree(){ return this.has.occupying; }

  get(trait){
    for(const obj of this.objs)
      if(obj.is[trait])
        return obj;

    return null;
  }

  hasAdj(dir){
    const {adjs} = this;

    return adjs[dir] !== null;
  }

  adjRaw(dir){
    const {adjs} = this;

    return adjs[dir];
  }

  adj(dir){
    const {adjs} = this;

    if(adjs[dir] === null)
      this.gen(dir);

    return adjs[dir];
  }

  setAdj(dir, tile){
    this.adjs[dir] = tile;
  }

  addObj(obj){
    const {objs, has} = this;

    objs.add(obj);

    for(const trait in obj.is){
      if(trait in has) has[trait]++;
      else has[trait] = 1;
    }

    return this;
  }

  removeObj(obj){
    const {objs, has} = this;

    objs.delete(obj);

    for(const trait in obj.is)
      has[trait]--;

    return this;
  }

  update(){
    const {updates} = this.grid;

    updates.add(this);
    
    for(const tile of this.adjRaw)
      if(tile !== null)
        updates.add(tile);
  }

  reset(){
    this.purge();
    this.grid.emit('reset', this);
    
    return this;
  }

  purge(){
    for(const obj of this.objs)
      obj.remove();

    return this;
  }
}

module.exports = Tile;