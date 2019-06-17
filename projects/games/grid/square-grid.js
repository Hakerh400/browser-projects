'use strict';

const Grid = require('./Grid');
const Tile = require('../tile');

const createObj = () => {
  const obj = O.obj();
  obj.size = 0;
  return obj;
};

class SquareGrid extends Grid{
  #data = createObj();

  get(x, y){
    const d = this.#data[y];
  }
};

module.exports = SquareGrid;