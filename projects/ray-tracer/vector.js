'use strict';

class Vector{
  constructor(x, y, z){
    this.set_(x, y, z);
  }

  clone(){ return new Vector(this.x, this.y, this.z); }
  dist_(x, y, z){ return Math.sqrt((this.x - x) ** 2 + (this.y - y) ** 2 + (this.z - z) ** 2); }
  dists_(x, y, z){ return (this.x - x) ** 2 + (this.y - y) ** 2 + (this.z - z) ** 2; }
  distm_(x, y, z){ return Math.abs(this.x - x) + Math.abs(this.y - y) + Math.abs(this.z - z); }

  len(){ return this.dist_(0, 0, 0); }
  lens(){ return this.dists_(0, 0, 0); }
  lenm(){ return this.distm_(0, 0, 0); }

  setLen(len){ return this.mul(len / this.len()); }
  norm(){ return this.setLen(1); }

  set_(x, y, z){ this.x = x, this.y = y, this.z = z; return this; }
  add_(x, y, z){ this.x += x, this.y += y, this.z += z; return this; }
  sub_(x, y, z){ this.x -= x, this.y -= y, this.z -= z; return this; }

  mul(k){ this.x *= k, this.y *= k, this.z *= k; return this; }
  div(k){ if(k){ this.x /= k, this.y /= k, this.z /= k; } return this; }

  rot_(rx, ry, rz){
    var x = this.x, y = this.y, z = this.z;

    var s = Math.sin(rx), c = Math.cos(rx);
    var x1 = x, y1 = y * c - z * s, z1 = y * s + z * c;

    s = Math.sin(ry), c = Math.cos(ry);
    var x2 = x1 * c + z1 * s, y2 = y1, z2 = z1 * c - x1 * s;

    s = Math.sin(rz), c = Math.cos(rz);
    return this.set_(x2 * c - y2 * s, x2 * s + y2 * c, z2);
  }

  rotn_(rx, ry, rz){ return this.rot_(-rx, -ry, -rz); }

  lt_(x, y, z){ return this.x < x && this.y < y && this.z < z; }
  gt_(x, y, z){ return this.x > x && this.y > y && this.z > z; }

  set(v){ return this.set_(v[0], v[1], v[2]); }
  dist(v){ return this.dist_(v[0], v[1], v[2]); }
  dists(v){ return this.dists_(v[0], v[1], v[2]); }
  distm(v){ return this.distm_(v[0], v[1], v[2]); }
  add(v){ return this.add_(v[0], v[1], v[2]); }
  sub(v){ return this.sub_(v[0], v[1], v[2]); }
  rot(v){ return this.rot_(v[0], v[1], v[2]); }
  rotn(v){ return this.rotn_(v[0], v[1], v[2]); }
  lt(v){ return this.lt_(v[0], v[1], v[2]); }
  gt(v){ return this.gt_(v[0], v[1], v[2]); }
};

module.exports = Vector;