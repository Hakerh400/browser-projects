'use strict';

const structs = require('./structs');
const biomes = require('./biomes');
const TileContent = require('./tile-content');

const initialBiome = biomes.Meadow;

const stats = O.enum([
  'GENERATING',
  'READY',
  'DONE',
]);

initStructs();

class Tile{
  constructor(){
    this.status = stats.READY;

    this.structs = [];
    this.content = null;

    this.sti = -1;
    this.dirs = 0;

    this.active = 0;
  }

  static initial(){
    var d = new Tile();

    var st = new initialBiome();
    d.addStruct(st);

    if(O.rand(100) === 0){
      var forest = new biomes.Meadow.Forest();
      forest.content.set(new biomes.Meadow.Tree());
      d.addStruct(forest);
    }

    return d;
  }

  tick(){
    if(!this.active) err('tick');
    this.content.tick();
  }

  draw(g){
    /*const {dirs} = this;
    g.fillStyle = ['#f00', '#f80', '#ff0', '#0f0', '#0ff'][4 - (
      (dirs & 1) +
      ((dirs >> 1) & 1) +
      ((dirs >> 2) & 1) +
      ((dirs >> 3) & 1)
    )];
    g.fillRect(0, 0, 1, 1);
    return;*/

    var {content} = this;

    if(content === null){
      var contentArr = this.structs.map(st => st.content);
      content = TileContent.concat(contentArr, 0);
    }

    content.draw(g);
  }

  expand(dir, d){
    if(this.status === stats.DONE) err('expand 1');
    if((this.dirs & (1 << dir)) === 0) err('expand 2');

    var {sti} = this;
    this.structs[sti].dirs &= ~(1 << dir);
    this.updateStatus();

    if(d === null) d = new Tile();
    if(d.status === stats.DONE) return d;

    return Tile.initial();
  }

  addStruct(st){
    if(this.status === stats.DONE) err('addStruct');

    this.structs.push(st);
    return this.updateStatus();
  }

  addStructs(sts){
    if(this.status === stats.DONE) err('addStructs');
    const {structs} = this;

    sts.forEach(st => structs.push(st));
    return this.updateStatus();
  }

  setDirs(dirs){
    if(this.status === stats.DONE) err('setDirs');

    var st = this.structs[this.sti];
    st.dirs = dirs;

    return this.updateStatus();
  }

  updateStatus(){
    if(this.status === stats.DONE) err('updateStatus');

    const {structs} = this;
    var sti, dirs;

    var sti = structs.findIndex(st => {
      return st.dirs !== 0;
    });

    if(sti === -1) dirs = 0;
    else dirs = structs[sti].dirs;

    if(dirs !== 0) this.status = stats.GENERATING;
    else this.status = stats.READY;

    this.sti = sti;
    this.dirs = dirs;

    return this;
  }

  finish(){
    if(this.status !== stats.READY) err('finish');

    var contentArr = this.structs.map(st => st.content);
    this.content = TileContent.concat(contentArr, 0);

    this.structs = null;
    this.status = stats.DONE;

    return this;
  }
};

Tile.stats = stats;

module.exports = Tile;

function initStructs(){
  structs.biomes = biomes;
  structs.randBiome = biomes.rand;
}

function commonCtor(stPrev, st){
  var proto1 = O.proto(stPrev);
  var proto2 = O.proto(st);

  var ctor = O.commonProto([proto1, proto2], 0).constructor;
  return ctor.choose(stPrev, st);
}

function err(msg){
  // TODO: Remove this and all checks
  throw new Error(msg);
}