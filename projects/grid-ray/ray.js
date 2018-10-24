'use strict';

class Ray{
  constructor(x, y, angle){
    const xx = Math.floor(x);
    const yy = Math.floor(y);

    this.x = xx;
    this.y = yy;
    this.dx = x - xx;
    this.dy = y - yy;

    const rx = Math.cos(angle);
    const ry = Math.sin(angle);

    this.rx = rx;
    this.ry = ry;

    this.arx = Math.abs(rx);
    this.ary = Math.abs(ry);

    this.ax = rx > 0;
    this.ay = ry > 0;
    
    this.sx = this.ax ? 1 : -1;
    this.sy = this.ay ? 1 : -1;
  }

  move(){
    const {dx, dy, rx, ry, arx, ary, ax, ay, sx, sy} = this;

    const w = ax ? 1 - dx : dx;
    const h = ay ? 1 - dy : dy;

    if(arx * h > ary * w){
      this.x += sx;
      this.dx = ax ? 0 : 1;
      this.dy += w * ry / arx;

      if(this.dy < 0) this.dy++;
      else if(this.dy > 1) this.dy--;
    }else{
      this.y += sy;
      this.dx += h * rx / ary;
      this.dy = ay ? 0 : 1;

      if(this.dx < 0) this.dx++;
      else if(this.dx > 1) this.dx--;
    }
  }
};

module.exports = Ray;