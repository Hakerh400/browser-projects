'use strict';

class Grid extends O.EventEmitter{
  get(){ O.virtual('get'); }
  set(){ O.virtual('set'); }
  prune(){ O.virtual('prune'); }
  relocate(){ O.virtual('relocate'); }
};

module.exports = Grid;

const SquareGrid = require('./square-grid');

Object.assign(Grid, {
  SquareGrid,
});