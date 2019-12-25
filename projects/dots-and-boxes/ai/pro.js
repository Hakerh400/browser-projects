'use strict';

const AI = require('./ai');
const Node = require('./node');

class AIPro extends AI{
  play(){
    const {grid, player, depth} = this;
  }
}

module.exports = AIPro;