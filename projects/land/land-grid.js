'use strict';

const ExpandableGrid = require('./expandable-grid');
const Tile = require('./tile');
const CoordinatesCollection = require('./coords');

class LandGrid extends ExpandableGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.gen1 = new O.Map2D();
    this.gen2 = new CoordinatesCollection();

    this.cs = [0, 0];

    this.gen(x, y, 1);
  }

  tick(){
    this.updateGen();

    this.iterate(1, (x, y, d) => {
      if(d === null){
        d = this.gen(x, y);
        if(d === null) return;
      }
    });
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      if(d === null) return;

      g.fillStyle = d.a;
      g.fillRect(x, y, 1, 1);
    });
  }

  updateGen(){
    var [x, y] = this.gen2.rand(this.cs);

    var d = new Tile();
    this.set(x, y, d);

    this.adj(x, y, (x, y) => {
      this.gen(x, y);
    });
  }

  gen(x, y, force=0){
    var {gen1, gen2} = this;

    if(this.get(x, y) !== null) return;
    if(gen2.has(x, y)) return;

    if(!force && this.adjNum(x, y) === 0){
      this.gen1.add(x, y);
    }else{
      this.gen1.remove(x, y);
      this.gen2.add(x, y);
    }
  }
};

module.exports = LandGrid;