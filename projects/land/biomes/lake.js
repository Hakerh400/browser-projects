'use strict';

const structs = require('../structs');
const TileContent = require('../tile-content');
const objs = require('../tile-objects');

class Lake extends structs.Biome{
  constructor(id, stab){
    super(id, stab);

    var {content} = this;
    content.set(new Water(this, this.stab));
  }

  static gen(stPrev, st, dir, prev, d){
    if(stPrev.constructor === Lake){
      var id = stPrev.id;
      var stab = structs.ExpandableStructure.nextStab(stPrev.stab);
      if(stab === 0) return structs.randBiome(Lake).gen(stPrev, st, dir, prev, d);
    }else{
      if(st !== null && O.randf(stPrev.stab + st.stab) < stPrev.stab)
        return null;

      var id = null;
      var stab = 1;
    }

    var sts = [new Lake(id, stab)];

    return sts;
  }
};

class Water extends objs.Floor{
  constructor(st){
    super();
    this.st = st;
  }

  draw(g){
    var m = O.bound(this.st.stab, 0, 1) * 255;
    this.col = new O.Color(0, m, m).toString();

    g.fillStyle = this.col;
    g.fillRect(0, 0, 1, 1);
  }
};

module.exports = Lake;