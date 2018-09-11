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

var z = require('./structs');

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

    var st = new initialBiome();
    d.addStruct(st);

    return d;
  }

  tick(){}

  draw(g){
    var {content} = this;

    if(content === null){
      var contentArr = this.structs.map(st => st.content);
      content = TileContent.concat(contentArr, 0);
    }

    content.draw(g);
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

  setDirs(dirs){
    if(this.status === stats.DONE) err('setDirs');

    var st = this.structs[this.sti];
    st.dirs = dirs;

    this.updateStatus();
  }

  /*
    prev - The tile that requested generating this tile
    sti  - Index of the structure that performed the request
    dir  - Direction to the "prev" relative to this tile
  */

  update(prev, sti, dir){
    if(this.status === stats.DONE) err('update');
    var {structs} = this;
    var structsPrev = prev.structs;

    var stPrev = prev.structs[sti];
    var hasStruct = sti < structs.length;
    var ctor, newSts;

    for(var i = 0; i !== sti; i++){
      // If the parent structures are different,
      // then stop expanding child structures

      if(!structsPrev[i].same(structs[i]))
        return;
    }

    if(!hasStruct){
      // This tile has no structure at index `sti`

      if(sti !== structs.length){
        // The parent structure doesn't want to expand,
        // so the child structure stops here
        return;
      }

      ctor = stPrev.constructor;
      newSts = ctor.gen(stPrev, null, dir, prev, this);
    }else{
      // This tile has a structure at index `sti`

      var st = structs[sti];

      if(st.same(stPrev)){
        newSts = st.constructor.combine(stPrev, st, prev, this);
        if(newSts === null) return;
      }else{
        ctor = commonCtor(stPrev, st);
        if(ctor === null) return;

        if(ctor === st.constructor){
          newSts = ctor.combine(stPrev, st, prev, this);
          if(newSts === null) return;
        }else{
          newSts = ctor.gen(stPrev, st, dir, prev, this);
          if(newSts === null) return;

          if(newSts.length !== 0 && newSts[0].same(st))
            newSts[0].id = st.id;
        }
      }

      structs.length = sti;
    }

    this.addStructs(newSts);
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
    this.content = TileContent.concat(contentArr, 0);

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

function commonCtor(stPrev, st){
  var proto1 = O.proto(stPrev);
  var proto2 = O.proto(st);

  var ctor = O.commonProto([proto1, proto2], 0).constructor;
  return ctor.choose(stPrev, st);
}

function err(msg){
  throw new Error(msg);
}