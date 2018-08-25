'use strict';

const ExtensibleGrid = require('./extensible-grid');

class Grid extends ExtensibleGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      g.fillStyle = O.Color.from(O.hsv((d & 7) / 8));
      g.fillRect(x, y, 1, 1);
    });
  }
};

module.exports = Grid;