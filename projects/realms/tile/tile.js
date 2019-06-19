'use strict';

class Tile{
  adj = O.ca(this.adjNum, () => null);
  objs = [];
  fstVis = 0;

  has = O.obj();

  constructor(grid, gravDir){
    this.grid = grid;
    this.gravDir = gravDir;
  }

  get adjNum(){ O.virtual('adjNum'); }
  draw(g){ O.virtual('draw'); }
  invDir(dir){ O.virtual('invDir'); }
  gen(){ O.virtual('gen'); }

  hasAdj(dir){
    const {adj} = this;

    return adj[dir] !== null;
  }

  adjRaw(dir){
    const {adj} = this;

    return adj[dir];
  }

  adj(dir){
    const {adj} = this;

    if(adj[dir] === null)
      this.gen(dir);

    return adj[dir];
  }

  setAdj(dir, tile){
    const {adj} = this;

    if(adj[dir] !== null)
      throw new TypeError(`Already has adjacent tile in direction ${dir}`);

    adj[dir] = tile;
  }

  addObj(obj){
    const {objs} = this;
    const len = objs.length;

    if(len === 0){
      objs.push(obj);
      return;
    }

    const {layer} = obj;

    let start = 0;
    let end = len - 1;

    while(1){
      const mid = start + end >> 1;

      if(layer > objs[mid].layer){
        if(start === mid) break;
        start = mid;
      }else{
        if(end === mid) break;
        end = mid;
      }
    }

    const index = layer > objs[end].layer ? end + 1 : end;
    objs.splice(index, 0, obj);
    
    if(index > this.fstVis){
      if(obj.is.opaque)
        this.fstVis = index;
    }else{
      this.fstVis++;
    }

    const {has} = this;
    for(const trait in obj.is){
      if(!(trait in has)) has[trait] = 1;
      else has[trait]++;
    }
  }

  removeObj(obj){
    const {objs} = this;
    const len = objs.length;

    const index = objs.indexOf(obj);
    objs.splice(index, 1);

    if(index >= this.fstVis){
      if(len !== 1){
        for(let i = index - 1; i !== 0; i--){
          if(objs[i].is.opaque){
            this.fstVis = i;
            break;
          }
        }
      }
    }else{
      this.fstVis--;
    }

    const {has} = this;
    for(const trait in obj.is)
      has[trait]--;
  }
}

module.exports = Tile;

const SquareTile = require('./square-tile');

Object.assign(Tile, {
  SquareTile,
});