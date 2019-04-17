'use strict';

const Object = require('./object');

class Water extends Object.Liquid{
  draw(g){
    g.fillStyle = '#08f';
    g.fillRect(0, 0, 1, 1);
  }
};

module.exports = Water;