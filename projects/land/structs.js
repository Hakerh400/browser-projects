'use strict';

const TileContent = require('./tile-content');
const objs = require('./tile-objects');

const STAB_DIFF_MIN = -.15;
const STAB_DIFF_MAX = .1;
const STAB_DIFF = STAB_DIFF_MAX - STAB_DIFF_MIN;

var id = -1;

class Structure{
  constructor(id=null, dirs=0){
    this.id = id !== null ? id : getID();
    this.dirs = dirs;
    this.content = new TileContent();
  }

  static gen(stPrev, st, dir, prev, d){ return null; }
  static combine(stPrev, st, prev, d){ return null; }

  static choose(stPrev, st, drift=.5){
    var ctor1 = stPrev.ctor;
    var ctor2 = st.ctor;

    if(O.randf(1) < drift)
      [ctor1, ctor2] = [ctor2, ctor1];

    if(st.pri() < stPrev.pri()) return st.constructor;
    if(stPrev.pri() < st.pri()) return stPrev.constructor;

    if(st.id > stPrev.id) return st.constructor;
    if(stPrev.id > st.id) return stPrev.constructor;
  }

  same(st){ return st.constructor === this.constructor; }
  pri(){ return .5; }
};

class ExpandableStructure extends Structure{
  constructor(id, dirs, stab=1){
    super(id, dirs);

    this.stab = stab;
  }

  static combine(stPrev, st, prev, d){
    var stab = (stPrev.stab + st.stab) / 2;
    stPrev.stab = stab;
    st.stab = stab;

    return null;
  }

  static nextStab(stab){
    stab += STAB_DIFF_MIN + O.randf(STAB_DIFF);
    if(stab < 0) stab = 0;
    return stab;
  }
};

class Biome extends ExpandableStructure{
  constructor(id, stab){
    super(id, 15, stab);
  }
};

const structs = {
  Structure,
  ExpandableStructure,
  Biome,
};

module.exports = structs;

function getID(){
  return id = id + 1 | 0;
}