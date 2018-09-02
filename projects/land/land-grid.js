'use strict';

const ExpandableGrid = require('./expandable-grid');
const Tile = require('./tile');

class LandGrid extends ExpandableGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.generating = new O.Map2D();

    this.gen(x, y, 1);
  }

  draw(x, y, g){
    this.iterate(x, y, 1, (x, y, d) => {
      if(d === null){
        d = this.gen(x, y);
        if(d === null) return;
      }
    });

    this.iterate(x, y, (x, y, d) => {
      if(d === null) return;

      g.fillStyle = d.a;
      g.fillRect(x, y, 1, 1);
    });
  }

  gen(x, y, force=0){
    var adj1 = [];
    var adj2 = [];

    this.adj(x, y, (x, y, d) => {
      adj1.push(d);
      if(d !== null) adj2.push(d);
    });

    if(adj2.length === 0 && !force)
      return null;

    var d = new Tile(x, y, adj1, adj2);
    this.set(x, y, d);

    return d;
  }
};

module.exports = LandGrid;