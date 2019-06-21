'use strict';

class Grid{
  constructor(reng){
    this.reng = reng;
  }

  get target(){ O.virtual('target'); }
  draw(g, t){ O.virtual('draw'); }
  zoom(dir){ O.virtual('scroll'); }
  has(){ O.virtual('has'); }
  gen(){ O.virtual('gen'); }
  getRaw(){ O.virtual('getRaw'); }
  get(){ O.virtual('get'); }
  set(){ O.virtual('set'); }
  prune(){ O.virtual('prune'); }
  relocate(){ O.virtual('relocate'); }
}

module.exports = Grid;

const SquareGrid = require('./square-grid');

Object.assign(Grid, {
  SquareGrid,
});