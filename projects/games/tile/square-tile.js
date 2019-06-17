'use strict';

const Tile = require('./Tile');

class SquareTile extends Tile{
  constructor(grid, gravDir){
    super(grid, gravDir);
  }

  get adjNum(){ return 4; }

  draw(g){
    const {objs} = this;
    const len = objs.length;

    for(let i = this.fstVis; i !== len; i++)
      objs[i].draw(g);
  }
};

module.exports = SquareTile;