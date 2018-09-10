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
  }

  static initial(){
    var d = new Tile();

    var st = new initialBiome(1);
    d.addStruct(st);

    return d;
  }

  tick(){}

  draw(g){
    this.content.draw(g);
  }

  addStruct(st){
    if(this.status === stats.DONE) err('addStruct');

    this.structs.push(st);
    this.updateStatus();
  }

  addStructs(sts){
    if(this.status === stats.DONE) err('addStructs');
    var {structs} = this;

    sts.forEach(st => structs.push(st));
    this.updateStatus();
  }

  /*
    prev - Tile that requested generating this tile
    sti  - Index of the structure that performed the request
    dir  - Direction to the "prev" relative to this tile
  */

  update(prev, sti, dir){
    if(this.status === stats.DONE) err('update');
    var {structs} = this;

    var stPrev = prev.structs[sti];
    var hasStruct = sti < structs.length;
    var ctor, newSts;

    if(!hasStruct){
      // This tile has no structure at index `sti`

      ctor = stPrev.constructor;
      newSts = ctor.gen(stPrev, null, dir, prev, this);
    }else{
      // This tile has a structure at index `sti`

      var st = structs[sti];
      if(st.pri() < stPrev.pri()) return;

      ctor = commonCtor(stPrev, st);
      if(ctor === null) return;

      newSts = ctor.gen(stPrev, st, dir, prev, this);
      if(newSts === null) return;

      structs.length = sti;
    }

    this.addStructs(newSts);
  }

  updateDirs(dirs){
    if(this.status === stats.DONE) err('updateDirs');

    var st = this.structs[this.sti];
    st.dirs = dirs;

    this.updateStatus();
  }

  updateStatus(){
    if(this.status === stats.DONE) err('updateStatus');
    var {structs} = this;
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
  }

  done(){
    if(this.status !== stats.READY) err('done');

    var contentArr = this.structs.map(st => st.content);
    this.content = TileContent.concat(contentArr);

    this.structs = null;
    this.status = stats.DONE;
  }
};

Tile.stats = stats;

module.exports = Tile;

function initStructs(){
  structs.biomes = biomes;
  structs.randBiome = biomes.rand;
}

function commonCtor(st1, st2){
  var proto1 = O.proto(st1);
  var proto2 = O.proto(st2);

  if(proto1 === proto2)
    return null;

  return O.commonProto([proto1, proto2], 0).constructor;
}

function err(msg){
  throw new Error(msg);
}