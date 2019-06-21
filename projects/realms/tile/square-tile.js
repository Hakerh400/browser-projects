'use strict';

const Tile = require('./tile');

class SquareTile extends Tile{
  constructor(grid, gravDir, x, y){
    super(grid, gravDir);

    this.x = x;
    this.y = y;

    this.pool = grid.pool;
  }

  get adjNum(){ return 4; }

  draw(getCtx, t){
    const {pool, objs} = this;
    let g;

    g = getCtx(0);
    g.fillStyle = Math.max(Math.abs(this.x), Math.abs(this.y)) & 1 ? '#f00' : '#ff0';
    g.fillRect(-.5, -.5, 1, 1);

    g = getCtx(2);
    g.fillStyle = 'white';
    g.fillRect(-.1, -.1, .2, .2);

    g = getCtx(1);
    g.fillStyle = 'black';
    g.fillRect(-.2, -.2, .4, .4);
  }

  invDir(dir){
    return dir + 2 & 3;
  }

  gen(dir){
    let {x, y} = this;

    switch(dir){
      case 0: y--; break;
      case 1: x++; break;
      case 2: y++; break;
      case 3: x--; break;
    }

    this.grid.gen(x, y);
  }
}

module.exports = SquareTile;