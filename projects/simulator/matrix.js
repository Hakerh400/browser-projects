'use strict';

const ident = new Float32Array([
  1, 0, 0,
  0, 1, 0,
  0, 0, 1,
]);

class Matrix{
  static ident(){ return ident.slice(); }
};

module.exports = Matrix;

const Vector = require('./vector');