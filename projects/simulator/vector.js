'use strict';

const {sqrt, sin, cos} = Math;

class Vector{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static from(v){ return new Vector(v.x, v.y, v.z); }
  static zero(){ return new Vector(0, 0, 0); }

  get lens(){
    const {x, y, z} = this;
    return x * x + y * y + z * z;
  }

  get len(){ return sqrt(this.lens); }

  set(v){ return this.set_(v.x, v.y, v.z); }
  add(v){ return this.add_(v.x, v.y, v.z); }
  sub(v){ return this.sub_(v.x, v.y, v.z); }

  set_(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }
  add_(x, y, z){ this.x += x; this.y += y; this.z += z; return this; }
  sub_(x, y, z){ this.x -= x; this.y -= y; this.z -= z; return this; }

  mul(s){ this.x *= s; this.y *= s; this.z *= s; return this; }
  div(s){ this.x /= s; this.y /= s; this.z /= s; return this; }

  norm(){ return this.div(this.len); }
};

module.exports = Vector;