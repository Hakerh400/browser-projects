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

    const n = Math.max(Math.abs(this.x), Math.abs(this.y));
    const k = t / 2e3 % 1;
    const a = k * O.pi2;

    g = getCtx(0);
    g.fillStyle = n & 1 ? '#f00' : '#ff0';
    g.fillRect(-.5 + Math.cos(a), -.5, 1, 1);

    g = getCtx(1);
    g.fillStyle = n & 2 ? '#0f0' : '#0ff';
    g.fillRect(-.3, -.3 + Math.sin(a), .6, .6);

    g = getCtx(2);
    g.fillStyle = n & 4 ? '#00f' : '#f0f';
    g.rotate(a);
    g.fillRect(-.15, -.15, .3, .3);
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