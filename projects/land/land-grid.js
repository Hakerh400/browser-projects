'use strict';

const ExpandableGrid = require('./expandable-grid');
const Tile = require('./tile');
const CoordinatesCollection = require('./coords');

const {stats} = Tile;

class LandGrid extends ExpandableGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.generatingTiles = new CoordinatesCollection();
    this.activeTiles = new CoordinatesCollection();

    var initialTile = Tile.initial();
    this.set(0, 0, initialTile);
    this.generatingTiles.add(0, 0); // TODO: move this line to the overriden set() method
  }

  tick(){
    this.expandRandTile();

    this.activeTiles.forEach((x, y) => {
      var d = this.get(x, y);
      //d.tick();
    });
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      if(d === null) return;
      d.draw(g);
      return;
      if(d === null || d.status !== stats.READY)
        return;

      g.translate(x, y);
      d.draw(g);
      g.translate(-x, -y);
    });
  }

  generate(){
    var nullTilesNum = 0;

    this.iterate(1, (x, y, d) => {
      if(d === null) nullTilesNum++;
    });

    while(nullTilesNum !== 0){
      if(this.expandRandTile(1))
        nullTilesNum--;
    }

    this.updateTiles();
  }

  expandRandTile(includeNulls=0){
    var tiles = this.generatingTiles;
    if(tiles.isEmpty()) return;

    var v = new O.Vector();
    tiles.rand(v);

    var d = this.get(v);
    var dir = randDir(d.dirs);
    ndir(v, dir);

    var d1 = this.get(v);
    if(!includeNulls && d1 === null) return;
    if(!this.isVisible(v, 1)) return;

    var newTile = d.expand(dir, d1);
    this.set(v, newTile);

    if(includeNulls) return d1 === null;
  }

  set(x, y, d){
    var gen = this.generatingTiles;
    var act = this.activeTiles;

    var old = this.get(x, y);
    if(old !== null){
      if(old.status === stats.GENERATING) gen.remove(x, y);
      if(old.active) act.remove(x, y);
    }

    if(d.status === stats.GENERATING) gen.add(x, y);
    if(d.active) act.add(x, y);

    return super.set(x, y, d);
  }

  onMove(){
    this.updateTiles(1);
  }

  updateTiles(reqGen=0){
    // TODO: iterate only through edges, not on the whole visible region,
    // except in case resetting is explicitly required

    var gen = this.generatingTiles.reset();
    var act = this.activeTiles.reset();
    var shouldGenerate = 0;

    this.iterate(1, (x, y, d) => {
      if(d === null){
        if(reqGen && this.isVisible(x, y))
          shouldGenerate = 1;
        return;
      }

      if(d.status === stats.GENERATING){
        gen.add(x, y);
        return;
      }

      if(d.active) act.add(x, y);
      if(d.status === stats.READY && this.isVisible(x, y)) d.done();
    });

    if(shouldGenerate)
      this.generate();
  }
};

module.exports = LandGrid;

function randDir(dirs){
  var num = 4 - (!(dirs & 1) + !(dirs & 2) + !(dirs & 4) + !(dirs & 8));
  var index = O.rand(num);

  for(var i = 0; i < 4; i++){
    if((dirs & 1) === 1 && index-- === 0) break;
    dirs >>= 1;
  }

  return i;
}

function ndir(vec, dir){
  var {x, y} = vec;

  switch(dir){
    case 0: y--; break;
    case 1: x++; break;
    case 2: y++; break;
    case 3: x--; break;
  }

  return vec.set(x, y);
}