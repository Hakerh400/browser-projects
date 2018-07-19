'use strict';

const cols = {
  bg: 'darkgray',
};

class Data{
  constructor(){
    var {w, h, g} = O.ceCanvas();

    this.w = w;
    this.h = h;

    this.canvas = g.canvas;
    this.g = g;

    this.clear();
  }

  clear(){
    var {w, h, g} = this;

    g.fillStyle = cols.bg;
    g.fillRect(0, 0, w, h);
  }
};

module.exports = Data;