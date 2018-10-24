'use strict';

class Ray extends Vector{
  constructor(x, y, z, rx, ry, rz){
    const xx = Math.floor(x);
    const yy = Math.floor(y);
    const zz = Math.floor(z);

    super(xx, yy, zz);

    this.dx = x - xx;
    this.dy = y - yy;
    this.dz = z - zz;

    this.rx = rx;
    this.ry = ry;
    this.rz = rz;

    this.arx = Math.abs(rx);
    this.ary = Math.abs(ry);
    this.arz = Math.abs(rz);

    this.ax = rx > 0;
    this.ay = ry > 0;
    this.az = rz > 0;

    this.sx = this.ax ? 1 : -1;
    this.sy = this.ay ? 1 : -1;
    this.sz = this.az ? 1 : -1;
  }

  move(){
    const {dx, dy, dz, rx, ry, rz, arx, ary, arz, ax, ay, az, sx, sy, sz} = this;

    const w = ax ? 1 - dx : dx;
    const h = ay ? 1 - dy : dy;
    const d = az ? 1 - dz : dz;

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