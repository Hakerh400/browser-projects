'use strict';

class Tile extends O.EventEmitter{
  adj = O.ca(this.adjNum, () => null);
  objs = [];
  fstVis = 0;
  has = O.obj();

  constructor(grid, gravDir){
    super();

    this.grid = grid;
    this.gravDir = gravDir;
  }

  get adjNum(){ O.virtual('adjNum'); }
  draw(g){ O.virtual('draw'); }

  addObj(obj){
    const {objs} = this;
    const len = objs.length;

    if(len === 0){
      objs.push(obj);
      return this;
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

    return this;
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

    return this;
  }
};

module.exports = Tile;

const SquareTile = require('./square-tile');

Object.assign(Tile, {
  SquareTile,
});