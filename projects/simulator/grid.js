'use strict';

const Tile = require('./tile');
const Vector = require('./vector');

class Grid extends O.EventEmitter{
  constructor(){
    super();

    this.d = O.obj();

    this.xMin = this.xMax = null;
    this.yMin = this.yMax = null;
    this.zMin = this.zMax = null;
  }

  has(x, y, z){
    const {d} = this;
    return y in d && z in d[y] && x in d[y][z];
  }

  gen(x, y, z){
    const {d} = this;

    if(this.xMin === null){
      this.xMin = this.xMax = x;
      this.yMin = this.yMax = y;
      this.zMin = this.zMax = z;
    }else{
      if(x < this.xMin) this.xMin = x;
      else if(x > this.xMax) this.xMax = x;
      if(y < this.yMin) this.yMin = y;
      else if(y > this.yMax) this.yMax = y;
      if(z < this.zMin) this.zMin = z;
      else if(z > this.zMax) this.zMax = z;
    }

    const tile = new Tile(this, x, y, z);
    this.set(x, y, z, tile);
    this.emit('gen', tile, x, y, z);

    return tile;
  }

  get(x, y, z){
    const {d} = this;
    if(!this.has(x, y, z)) return this.gen(x, y, z);
    return d[y][z][x];
  }

  set(x, y, z, tile){
    const {d} = this;
    if(!(y in d)) d[y] = O.obj();
    if(!(z in d[y])) d[y][z] = O.obj();
    d[y][z][x] = tile;
  }

  hasv(v){ return this.has(v.x, v.y, v.z); }
  genvv(v){ return this.genv(v.x, v.y, v.z); }
  getv(v){ return this.get(v.x, v.y, v.z); }
  setv(v, tile){ return this.set(v.x, v.y, v.z, tile); }
};

module.exports = Grid;