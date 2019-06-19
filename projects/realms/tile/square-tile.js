'use strict';

const Tile = require('./Tile');

class SquareTile extends Tile{
  constructor(grid, gravDir, x, y){
    super(grid, gravDir);

    this.x = x;
    this.y = y;
  }

  get adjNum(){ return 4; }

  draw(g){
    const {objs} = this;
    const len = objs.length;

    g.fillStyle = O.Color.from(O.hsv(Math.max(Math.abs(this.x), Math.abs(this.y)) / 6 % 1));
    g.fillRect(-.5, -.5, 1, 1);

    for(let i = this.fstVis; i !== len; i++)
      objs[i].draw(g);
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