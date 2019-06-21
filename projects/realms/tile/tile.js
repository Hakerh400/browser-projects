'use strict';

class Tile{
  adjs = O.ca(this.adjNum, () => null);
  objs = new Set();
  has = O.obj();

  constructor(grid, gravDir){
    this.grid = grid;
    this.gravDir = gravDir;
  }

  get adjNum(){ O.virtual('adjNum'); }
  draw(g, t){ O.virtual('draw'); }
  invDir(dir){ O.virtual('invDir'); }
  gen(){ O.virtual('gen'); }

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
  }

  removeObj(obj){
    const {objs, has} = this;

    objs.add(obj);

    for(const trait in obj.is)
      has[trait]--;
  }
}

module.exports = Tile;

const SquareTile = require('./square-tile');

Object.assign(Tile, {
  SquareTile,
});