'use strict';

const Object = require('./object');

class Lava extends Object.Liquid{
  draw(g){
    g.fillStyle = '#f30';
    g.fillRect(0, 0, 1, 1);
  }
};

module.exports = Lava;