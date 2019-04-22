'use strict';

const m1 = require('./models/wavefront/man-standing');
const m2 = require('./models/wavefront/man-walking-right');
const m3 = require('./models/wavefront/man-walking-left');

let gl, attribs;
let v1Buf, v2Buf, n1Buf, n2Buf, texBuf, indBuf;

class Model{
  constructor(verts, norms, tex, inds){
    this.verts = new Float32Array(verts);
    this.norms = new Float32Array(norms);
    this.tex = new Float32Array(tex);
    this.inds = new Uint16Array(inds);

    this.len = inds.length;
  }

  static init(glCtx, attribsObj){
    gl = glCtx;
    attribs = attribsObj;

    v1Buf = gl.createBuffer();
    v2Buf = gl.createBuffer();
    n1Buf = gl.createBuffer();
    n2Buf = gl.createBuffer();
    texBuf = gl.createBuffer();
    indBuf = gl.createBuffer();
  }

  static buffer(m1, m2=m1){
    gl.bindBuffer(gl.ARRAY_BUFFER, v1Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.v1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, v2Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m2.verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.v2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, n1Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.norms, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.n1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, n2Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m2.norms, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.n2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.tex, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.tex, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m1.inds, gl.STATIC_DRAW);
  }

  buffer(m2){
    return Model.buffer(this, m2);
  }
};

class Cuboid extends Model{
  constructor(x1, y1, z1, w, h, d, uv=1){
    const x2 = x1 + w;
    const y2 = y1 + h;
    const z2 = z1 + d;
    const dd = 1e-3;

    const verts = [
      x1, y2 - dd, z1, x2, y2 - dd, z1, x1, y2 - dd, z2, x2, y2 - dd, z2, // Top
      x1, y1 + dd, z1, x2, y1 + dd, z1, x1, y1 + dd, z2, x2, y1 + dd, z2, // Bottom
      x1, y1, z2 - dd, x2, y1, z2 - dd, x1, y2, z2 - dd, x2, y2, z2 - dd, // Left
      x1, y1, z1 + dd, x2, y1, z1 + dd, x1, y2, z1 + dd, x2, y2, z1 + dd, // Right
      x2 - dd, y1, z1, x2 - dd, y2, z1, x2 - dd, y1, z2, x2 - dd, y2, z2, // Front
      x1 + dd, y1, z1, x1 + dd, y2, z1, x1 + dd, y1, z2, x1 + dd, y2, z2, // Back
    ];

    const norms = [
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // Left
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Front
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Back
    ];

    const sx = 1 / 4, sy = 1 / 3;
    const tex = !uv ? [
      1, 1, 0, 1, 1, 0, 0, 0, // Top
      1, 0, 0, 0, 1, 1, 0, 1, // Bottom
      0, 1, 1, 1, 0, 0, 1, 0, // Left
      1, 1, 0, 1, 1, 0, 0, 0, // Right
      1, 1, 1, 0, 0, 1, 0, 0, // Front
      0, 1, 0, 0, 1, 1, 1, 0, // Back
    ] : [
      2, 0, 2, 1, 1, 0, 1, 1, // Top
      2, 3, 2, 2, 1, 3, 1, 2, // Bottom
      0, 2, 1, 2, 0, 1, 1, 1, // Left
      3, 2, 2, 2, 3, 1, 2, 1, // Right
      2, 2, 2, 1, 1, 2, 1, 1, // Front
      3, 2, 3, 1, 4, 2, 4, 1, // Back
    ].map((a, b) => a * (b & 1 ? sy : sx));

    const inds = [
      0, 1, 2, 1, 2, 3, // Top
      4, 5, 6, 5, 6, 7, // Bottom
      8, 9, 10, 9, 10, 11, // Left
      12, 13, 14, 13, 14, 15, // Right
      16, 17, 18, 17, 18, 19, // Front
      20, 21, 22, 21, 22, 23, // Back
    ];

    super(verts, norms, tex, inds);
  }
};

class Test extends Model{
  constructor(m){
    const verts = [];
    const norms = [];
    const tex = [];
    const inds = [];

    const norms_ = [];
    const tex_ = [];

    const lines = O.sanl(m);
    let j = 0, k1 = 0, k2 = 0;

    for(let i = 0; i !== lines.length; i++){
      const line = lines[i];
      const args = line.split(' ');
      const cmd = args.shift();

      switch(cmd){
        case 'v':
          verts.push(+args[0], +args[1], +args[2]);
          break;

        case 'vn':
          norms_.push(+args[0], +args[1], +args[2]);
          break;

        case 'vt':
          tex_.push(+args[0], 1 - args[1]);
          break;

        case 'f':
          const a = args.map(a => a.split('/').map(a => ~-a));

          if(a.length === 3){
            inds.push(a[0][0], a[1][0], a[2][0]);

            norms[k1 = a[0][0] * 3] = norms_[k2 = a[0][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];
            norms[k1 = a[1][0] * 3] = norms_[k2 = a[1][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];
            norms[k1 = a[2][0] * 3] = norms_[k2 = a[2][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];

            tex[k1 = a[0][0] * 2] = tex_[k2 = a[0][1] * 2], tex[k1 + 1] = tex_[k2 + 1];
            tex[k1 = a[1][0] * 2] = tex_[k2 = a[1][1] * 2], tex[k1 + 1] = tex_[k2 + 1];
            tex[k1 = a[2][0] * 2] = tex_[k2 = a[2][1] * 2], tex[k1 + 1] = tex_[k2 + 1];
          }else{
            throw new Error(`Unsupported face with ${a.length} edges`);
          }
          break;
      }
    }

    super(verts, norms, tex, inds);
  }
};

Model.Cuboid = Cuboid;
Model.Test = Test;

Object.assign(Model, {
  sky: [new Model.Cuboid(-.5, -.5, -.5, 1, 1, 1, 1)],
  cube: [new Model.Cuboid(-.5, -.5, -.5, 1, 1, 1, 0)],
  test1: [new Model.Test(m2), new Model.Test(m3)],
  test2: [new Model.Test(m3), new Model.Test(m2)],
});

module.exports = Model;