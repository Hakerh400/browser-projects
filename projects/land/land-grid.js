'use strict';

const ExpandableGrid = require('./expandable-grid');
const Tile = require('./tile');
const CoordinatesCollection = require('./coords');
const modes = require('./set-modes');

const GEN_SPEED = 100;

const {stats} = Tile;

class LandGrid extends ExpandableGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.generatingTiles = new CoordinatesCollection();
    this.activeTiles = new CoordinatesCollection();

    var initialTile = Tile.initial();
    this.set(0, 0, initialTile);

    this.mode = modes[0];
    this.num = 0;

    this.generate();
  }

  tick(){
    for(var i = 0; i !== GEN_SPEED; i++)
      this.expandRandTile();

    this.activeTiles.forEach((x, y) => {
      var d = this.get(x, y);
      //d.tick();
    });
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      if(d === null){
        g.fillStyle = 'red';
        g.fillRect(x, y, 1, 1);
      }else if(d.status === stats.DONE){
        g.fillStyle = 'yellow';
        g.fillRect(x, y, 1, 1);
      }

      if(d && d.status === stats.READY)
        d.finish();

      if(d === null || d.status !== stats.DONE)
        return;

      g.translate(x, y);
      d.draw(g);
      g.translate(-x, -y);
    });
  }

  generate(){
    this.setMode(1);

    this.iterate(1, (x, y, d) => {
      if(d === null/* || d.status === stats.GENERATING*/)
        this.num++;
    });

    while(this.num !== 0)
      this.expandRandTile(1);

    this.setMode(0);
    this.updateTiles();
  }

  expandRandTile(includeNulls=0){
    const gen = this.generatingTiles;
    if(gen.isEmpty()) return;

    var v = new O.Vector();
    gen.rand(v);

    var {x, y} = v;
    var d = this.get(v);
    var dir = randDir(d.dirs);

    ndir(v, dir);
    var d1 = this.get(v);

    if(!includeNulls)
      if(d1 === null || !this.isVisible(v, 1))
        return;

    var d2 = d.expand(dir, d1);
    this.set(v, d2);

    if(d.status !== stats.GENERATING)
      gen.remove(x, y);
  }

  set(x, y, d){
    if(x instanceof O.Vector) (d = y, {x, y} = x);

    const gen = this.generatingTiles;
    const act = this.activeTiles;
    const {mode} = this;

    const old = this.get(x, y);

    if(old !== null){
      if(old.status === stats.GENERATING) gen.remove(x, y);
      if(old.active) act.remove(x, y);
      if(en && isVisible/* && old.status === stats.READY*/) this.num++;
    }

    if(d !== null){
      if(d.status === stats.GENERATING) gen.add(x, y);
      if(d.active) act.add(x, y);
      if(en && isVisible/* && d.status === stats.READY*/) this.num--;
    }

    if(mode(this, old)) this.num++;
    if(mode(this, d)) this.num--;

    return super.set(x, y, d);
  }

  updateTiles(reqGen=0){
    // TODO: iterate only over edges, not over the whole visible region,
    // except in case when resetting is explicitly required

    var gen = this.generatingTiles.reset();
    var act = this.activeTiles.reset();
    var shouldGenerate = 0;

    this.iterate(1, (x, y, d) => {
      var isVisible = this.isVisible(x, y);

      if(d === null){
        if(reqGen && isVisible)
          shouldGenerate = 1;
        return;
      }

      if(d.status === stats.GENERATING){
        gen.add(x, y);
        return;
      }

      if(d.active) act.add(x, y);
    });

    if(shouldGenerate)
      this.generate();
  }

  onMove(){
    this.updateTiles(1);
  }

  setMode(mode){
    this.mode = modes[mode];
    this.num = 0;
  }
};

module.exports = LandGrid;

function randDir(dirs){
  var num = 4 - (!(dirs & 1) + !(dirs & 2) + !(dirs & 4) + !(dirs & 8));
  var index = O.rand(num);

  for(var i = 0; i !== 4; i++){
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