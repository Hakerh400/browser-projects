'use strict';

const SPEED_FACTOR = .2;
const SPEED_MIN = .02;

const BG_COL = '#000000';

class RenderingEngine{
  constructor(grid, s){
    var {w, h, g} = O.ceCanvas(1);

    this.w = w;
    this.h = h;
    this.wh = w / 2;
    this.hh = h / 2;

    this.s = s;
    this.g = g;
    this.grid = grid;

    this.x = grid.x;
    this.y = grid.y;
    this.speed = new O.Vector(0, 0);

    this.renderBound = this.render.bind(this);
  }

  render(){
    var {g, grid} = this;

    g.resetTransform();
    g.clearCanvas(BG_COL);

    g.translate(this.wh, this.hh);
    g.scale(this.s);

    this.updateCoords();
    g.translate(-this.x - .5, -this.y - .5);

    grid.draw(Math.floor(this.x), Math.floor(this.y), g);

    requestAnimationFrame(this.renderBound);
  }

  move(x, y){
    this.grid.move(x, y);
  }

  updateCoords(){
    var {x, y} = this;
    var {x: tx, y: ty} = this.grid;
    if(x === tx && y === ty) return;

    var sp = this.speed;
    sp.x = tx - x;
    sp.y = ty - y;

    var len = sp.len();
    if(len < SPEED_MIN){
      this.x = tx;
      this.y = ty;
      return;
    }

    sp.setLen(len * SPEED_FACTOR);
    this.x += sp.x;
    this.y += sp.y;
  }
};

module.exports = RenderingEngine;