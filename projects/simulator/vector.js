'use strict';

const {abs, sqrt, sin, cos} = Math;

class Vector{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(){ return new Vector(0, 0, 0); }
  static from(v){ return new Vector(v.x, v.y, v.z); }

  static revDir(dir){
    if(dir < 4) return dir + 2 & 3;
    if(dir === 4) return 5;
    return 4;
  }

  static dirMat(dir, axis, mat=auxMat){
    let sx = 0, cx = 1;
    let sy = 0, cy = 1;
    let sz = 0, cz = 1;
    let s1, c1, s2, c2;

    switch(dir){
      case 0: s1 = 1, c1 = 0, s2 = 0, c2 = 1; break;
      case 1: s1 = 0, c1 = 1, s2 = 1, c2 = 0; break;
      case 2: s1 = -1, c1 = 0, s2 = 0, c2 = 1; break;
      case 3: s1 = 0, c1 = 1, s2 = -1, c2 = 0; break;
      case 4: s1 = 0, c1 = 1, s2 = 0, c2 = -1; break;
      case 5: s1 = 0, c1 = 1, s2 = 0, c2 = 1; break;
    }

    if(axis === 0) sy = s1, cy = c1, sz = s2, cz = c2;
    else if(axis === 1) sx = s1, cx = c1, sz = s2, cz = c2;
    else sx = s1, cx = c1, sy = s2, cy = c2;

    mat[0] = cx * cz - cy * sx * sz;
    mat[1] = -cx * sz - cy * sx * cz;
    mat[2] = sx * sy;

    mat[3] = sx * cz + cy * cx * sz;
    mat[4] = -sx * sz + cy * cx * cz;
    mat[5] = -cx * sy;

    mat[6] = sz * sy;
    mat[7] = cz * sy;
    mat[8] = cy;

    return mat;
  }

  static dirMatn(dir, exis, mat){ return Vector.dirMat(Vector.revDir(dir), axis, mat); }

  clone(){ return new Vector(this.x, this.y, this.z); }

  get len(){ const {x, y, z} = this; return sqrt(x * x + y * y + z * z); }
  get lens(){ const {x, y, z} = this; return x * x + y * y + z * z; }
  get lenm(){ return abs(this.x) + abs(this.y) + abs(this.z); }

  set len(len){ this.mul(len / this.len); }
  setLen(len){ this.mul(len / this.len); return this; }

  set(x, y, z){ this.x = x; this.y = y; this.z = z; return this; }
  add(x, y, z){ this.x += x; this.y += y; this.z += z; return this; }
  sub(x, y, z){ this.x -= x; this.y -= y; this.z -= z; return this; }

  dist(x, y, z){ const dx = this.x - x, dy = this.y - y, dz = this.z - z; return sqrt(x * x + y * y + z * z); }
  dists(x, y, z){ const dx = this.x - x, dy = this.y - y, dz = this.z - z; return x * x + y * y + z * z; }
  distm(x, y, z){ return abs(this.x - x) + abs(this.y - y) + abs(this.z - z); }

  rot(rx, ry, rz){
    const {x, y, z} = this;

    const sx = sin(rx), cx = cos(rx);
    const y1 = y * cx - z * sx, z1 = y * sx + z * cx;

    const sy = sin(ry), cy = cos(ry);
    const x2 = x * cy + z1 * sy, z2 = z1 * cy - x * sy;

    const sz = sin(rz), cz = cos(rz);
    this.x = x2 * cz - y1 * sz, this.y = x2 * sz + y1 * cz, this.z = z2;

    return this;
  }

  rotsc(sx, cx, sy, cy, sz, cz){
    const {x, y, z} = this;

    const y1 = y * cx - z * sx, z1 = y * sx + z * cx;
    const x2 = x * cy + z1 * sy, z2 = z1 * cy - x * sy;
    this.x = x2 * cz - y1 * sz, this.y = x2 * sz + y1 * cz, this.z = z2;

    return this;
  }

  rotn(rx, ry, rz){ return this.rot(-rx, -ry, -rz); }
  rotnsc(sx, cx, sy, cy, sz, cz){ return this.rotsc(-sx, cx, -sy, cy, -sz, cz); }

  rotDir(dir){
    // TODO: check if this even works
    switch(dir){
      // TODO: replace all of these with `this.rotsc`
      case 0: this.rot(0, 0, 0); break; // TODO: delete case 0
      case 1: this.rot(0, O.pi32, 0); break;
      case 2: this.rot(0, O.pi, 0); break;
      case 3: this.rot(0, O.pih, 0); break;
      case 4: this.rot(O.pih, 0, 0); break;
      case 5: this.rot(O.pi32, 0, 0); break;
    }

    return this;
  }

  rotDirn(dir){ return this.rotDir(Vector.revDir(dir)); }

  lt(x, y, z){ return this.x < x && this.y < y && this.z < z; }
  gt(x, y, z){ return this.x > x && this.y > y && this.z > z; }

  setv(v){ return this.set(v.x, v.y, v.z); }
  addv(v){ return this.add(v.x, v.y, v.z); }
  subv(v){ return this.sub(v.x, v.y, v.z); }
  distv(v){ return this.dist(v.x, v.y, v.z); }
  distsv(v){ return this.dists(v.x, v.y, v.z); }
  distmv(v){ return this.distm(v.x, v.y, v.z); }
  rotv(v){ return this.rot(v.x, v.y, v.z); }
  rotnv(v){ return this.rotn(v.x, v.y, v.z); }
  rotDirv(v){ return this.rotDir(v.x, v.y, v.z); }
  ltv(v){ return this.lt(v.x, v.y, v.z); }
  gtv(v){ return this.gt(v.x, v.y, v.z); }

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

  navn(dir){ return this.nav(Vector.revDir(dir)); }

  *[Symbol.iterator](){
    yield this.x;
    yield this.y;
    yield this.z;
  }
};

module.exports = Vector;

const Matrix = require('./matrix');

const auxMat = Matrix.ident();