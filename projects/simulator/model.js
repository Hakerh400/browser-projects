'use strict';

const str = require('./1');

class Model{
  constructor(verts, norms, tex, inds){
    this.verts = new Float32Array(verts);
    this.norms = new Float32Array(norms);
    this.tex = new Float32Array(tex);
    this.inds = new Uint16Array(inds);

    this.len = inds.length;
  }
};

class Cuboid extends Model{
  constructor(x1, y1, z1, w, h, d){
    const x2 = x1 + w;
    const y2 = y1 + h;
    const z2 = z1 + d;

    const verts = [
      x1, y2, z1, x2, y2, z1, x1, y2, z2, x2, y2, z2, // Top
      x1, y1, z1, x2, y1, z1, x1, y1, z2, x2, y1, z2, // Bottom
      x1, y1, z2, x2, y1, z2, x1, y2, z2, x2, y2, z2, // Left
      x1, y1, z1, x2, y1, z1, x1, y2, z1, x2, y2, z1, // Right
      x2, y1, z1, x2, y2, z1, x2, y1, z2, x2, y2, z2, // Front
      x1, y1, z1, x1, y2, z1, x1, y1, z2, x1, y2, z2, // Back
    ];

    const norms = [
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // Top
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // Bottom
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // Left
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // Right
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, // Front
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // Back
    ];

    const tex = [
      1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, // Top
      1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, // Bottom
      0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, // Left
      1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, // Right
      1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, // Front
      0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0, 1, // Back
    ];

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

class Sphere extends Model{
  constructor(){
    const verts = [];
    const norms = [];
    const tex = [];
    const inds = [];

    const norms_ = [];

    const lines = O.sanl(str);
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

        case 'f':
          const a = args.map(a => a.split('/').map(a => ~-a));

          if(a.length === 3){
            inds.push(a[0][0], a[1][0], a[2][0]);

            norms[k1 = a[0][0] * 3] = norms_[k2 = a[0][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];
            norms[k1 = a[1][0] * 3] = norms_[k2 = a[1][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];
            norms[k1 = a[2][0] * 3] = norms_[k2 = a[2][2] * 3], norms[k1 + 1] = norms_[k2 + 1], norms[k1 + 2] = norms_[k2 + 2];

            tex[k1 = a[0][0] * 3] = 0, tex[k1 + 1] = 0, tex[k1 + 2] = 1;
            tex[k1 = a[1][0] * 3] = 0, tex[k1 + 1] = 1, tex[k1 + 2] = 1;
            tex[k1 = a[2][0] * 3] = 1, tex[k1 + 1] = 1, tex[k1 + 2] = 1;
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
Model.Sphere = Sphere;

Object.assign(Model, {
  cube: new Model.Cuboid(0, 0, 0, 1, 1, 1),
  sphere: new Model.Sphere(),
});

module.exports = Model;