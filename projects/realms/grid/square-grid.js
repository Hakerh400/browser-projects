'use strict';

const Grid = require('./Grid');
const Tile = require('../tile');

const createObj = () => {
  const obj = O.obj();
  obj.size = 0;
  return obj;
};

const createKey = (obj, key) => {
  obj.size++;
  const obj1 = obj[key] = createObj();
  return obj1;
};

class SquareGrid extends Grid{
  #d = createObj();

  has(x, y){
    let d = this.#d;
    if(!(y in d)) return 0;
    d = d[y];
    return x in d;
  }

  gen(x, y){
    let d = this.#d;

    if(!(y in d)) d = createKey(d, y);
    else d = d[y];

    if(x in d) throw new TypeError(`Already has (${x}, ${y})`);

    d.size++;
    const tile = d[x] = new Tile.SquareTile(this, 2, x, y);
    let adj;

    if(adj = this.getRaw(x, y - 1)) tile.setAdj(0, adj), adj.setAdj(2, tile);
    if(adj = this.getRaw(x + 1, y)) tile.setAdj(1, adj), adj.setAdj(3, tile);
    if(adj = this.getRaw(x, y + 1)) tile.setAdj(2, adj), adj.setAdj(0, tile);
    if(adj = this.getRaw(x - 1, y)) tile.setAdj(3, adj), adj.setAdj(1, tile);

    return tile;
  }

  getRaw(x, y){
    let d = this.#d;
    if(!(y in d)) return null;
    d = d[y];
    if(!(x in d)) return null;
    return d[x];
  }

  get(x, y){
    let d = this.#d;
    if(!(y in d)) return this.gen(x, y);
    d = d[y];
    if(!(x in d)) return this.gen(x, y);
    return d[x];
  }
};

module.exports = SquareGrid;