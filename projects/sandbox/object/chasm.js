'use strict';

const Object = require('./object');

class Chasm extends Object.Layer0{
  draw(g){
    g.fillStyle = 'black';
    g.fillRect(0, 0, 1, 1);
  }
};

module.exports = Chasm;