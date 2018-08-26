'use strict';

const ExtensibleGrid = require('./extensible-grid');
const Tile = require('./tile');

class LandGrid extends ExtensibleGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.gen(x, y, 1);
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      if(d === null){
        d = this.gen(x, y);
        if(d === null) return;
      }

      g.fillStyle = d.a;
      g.fillRect(x, y, 1, 1);
    });
  }

  gen(x, y, force=0){
    var adj = [];

    this.adj(x, y, (x, y, d) => {
      if(d !== null) adj.push(d);
    });

    if(adj.length === 0 && !force)
      return null;

    var d = new Tile(adj);
    this.set(x, y, d);

    return d;
  }
};

module.exports = LandGrid;