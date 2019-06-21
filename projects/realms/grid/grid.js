'use strict';

class Grid extends O.EventEmitter{
  constructor(reng){
    super();

    this.reng = reng;
  }

  get target(){ O.virtual('target'); }
  tick(){ O.virtual('tick'); }
  draw(g, t, k){ O.virtual('draw'); }
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
const HexagonalGrid = require('./hexagonal-grid');

Object.assign(Grid, {
  SquareGrid,
  HexagonalGrid,
});