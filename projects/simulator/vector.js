'use strict';

const {sqrt, sin, cos} = Math;

class Vector{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(){ return new Vector(0, 0, 0); }
  static from(v){ return new Vector(v.x, v.y, v.z); }

  clone(){ return new Vector(this.x, this.y, this.z); }

  get lens(){
    const {x, y, z} = this;
    return x * x + y * y + z * z;
  }

  get len(){ return sqrt(this.lens); }

  set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }
  add(x, y, z){ this.x += x; this.y += y; this.z += z; return this; }
  sub(x, y, z){ this.x -= x; this.y -= y; this.z -= z; return this; }

  setv(v){ return this.set(v.x, v.y, v.z); }
  addv(v){ return this.add(v.x, v.y, v.z); }
  subv(v){ return this.sub(v.x, v.y, v.z); }

  mul(s){ this.x *= s; this.y *= s; this.z *= s; return this; }
  div(s){ this.x /= s; this.y /= s; this.z /= s; return this; }

  norm(){ return this.div(this.len); }

  nav(dir){
    switch(dir){
      case 0: this.z--; break;
      case 1: this.x++; break;
      case 2: this.z++; break;
      case 3: this.x--; break;
      case 4: this.y--; break;
      case 5: this.y++; break;
    }

    return this;
  }
};

module.exports = Vector;