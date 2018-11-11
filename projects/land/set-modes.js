'use strict';

const Tile = require('./tile');

const {stats} = Tile;

const modes = [
  // 0 - Nop
  (G, d, v0, v1) => 0,

  // 1 - Non-null tiles from region 1
  (G, d, v0, v1) => v1 && d !== null,

  // 2 - Ready tiles from region 0
  (G, d, v0, v1) => v0 && d !== null && d.status === stats.READY,
];

module.exports = modes;