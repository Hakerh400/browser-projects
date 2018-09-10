'use strict';

const TileContent = require('./tile-content');
const objs = require('./tile-objects');

const STAB_DIFF_MIN = -.11;
const STAB_DIFF_MAX = .1;
const STAB_DIFF = STAB_DIFF_MAX - STAB_DIFF_MIN;

class Structure{
  constructor(dirs=0){
    this.dirs = dirs;
    this.content = new TileContent();
  }

  static gen(prev, dir){ return null; }

  pri(){ return .5; }
};

class ExpandableStructure extends Structure{
  constructor(dirs, stab=1){
    super(dirs);

    this.stab = stab;
  }

  static nextStab(stab){
    stab += STAB_DIFF_MIN + O.randf(STAB_DIFF);
    if(stab < 0) stab = 0;
    return stab;
  }
};

class Biome extends ExpandableStructure{
  constructor(stab){
    super(15, stab);
  }

  static gen(stPrev, st, dir, prev, d){
    var stCurr = O.randf(st.stab + stPrev.stab) < st.stab ? st : stPrev;
    var stab = ExpandableStructure.nextStab(stCurr.stab);

    var ctorNew = stab !== 0 ? stCurr.constructor : structs.randBiome();
    return ctorNew.get(stPrev, st, dir, prev, d);
  }
};

const structs = {
  Structure,
  ExpandableStructure,
  Biome,
};

module.exports = structs;