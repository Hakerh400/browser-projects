'use strict';

const Vector = require('./vector');

class Ray extends Vector{
  constructor(x, y, z, rx=1, ry=0, rz=0){
    super(x, y, z);

    this.rx = rx;
    this.ry = ry;
    this.rz = rz;
  }
};

module.exports = Ray;