'use strict';

const Tile = require('./tile');
const DiscreteRay = require('./discrete-ray');
const Vector = require('./vector');

class Grid extends O.EventEmitter{
  constructor(){
    super();

    this.d = O.obj();
  }

  has(x, y, z){
    const {d} = this;
    return y in d && z in d[y] && x in d[y][z];
  }

  gen(x, y, z){
    const {d} = this;

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

  getf(x, y, z){ return this.get(Math.floor(x), Math.floor(y), Math.floor(z)); }

  trace(ray, maxDist=null, findOpaque=1, findBlocking=1){
    let dPrev = this.getv(ray);
    let i = 0;

    while(1){
      const d = this.getv(ray.move());

      if(findOpaque && d.has.opaque || findBlocking && d.has.blocking){
        ray.nav(ray.dir);
        return d;
      }

      if(maxDist !== null && ++i === maxDist) break;

      dPrev = d;
    }

    return null;
  }

  hasv(v){ return this.has(v.x, v.y, v.z); }
  genvv(v){ return this.genv(v.x, v.y, v.z); }
  getv(v){ return this.get(v.x, v.y, v.z); }
  setv(v, tile){ return this.set(v.x, v.y, v.z, tile); }
  getfv(v){ return this.getf(v.x, v.y, v.z); }
};

module.exports = Grid;