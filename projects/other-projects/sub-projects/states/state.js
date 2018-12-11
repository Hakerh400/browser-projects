'use strict';

class State{
  constructor(grid, col, active=1){
    this.grid = grid;
    this.col = col;
    this.active = active;
  }

  isActive(){ return this.active; }
  isPasive(){ return !this.active; }
};

module.exports = State;