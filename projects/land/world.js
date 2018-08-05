'use strict';

const Grid = require('./grid');
const entCtors = require('./entity');

class World{
  constructor(display){
    this.display = display;

    this.w = display.w;
    this.h = display.h;
    this.s = display.s;
    this.g = display.g;

    this.grid = new Grid(this);
  }

  tick(){
    this
  }
};

module.exports = World;