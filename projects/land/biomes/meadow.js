'use strict';

const structs = require('../structs');
const TileContent = require('../tile-content');
const objs = require('../tile-objects');

class Meadow extends structs.Biome{
  constructor(id, stab){
    super(id, stab);

    var {content} = this;
    content.set(new Grass(this, this.stab));
  }

  static gen(stPrev, st, dir, prev, d){
    if(stPrev.constructor === Meadow){
      var id = stPrev.id;
      var stab = structs.ExpandableStructure.nextStab(stPrev.stab);
      if(stab === 0) return structs.randBiome(Meadow).gen(stPrev, st, dir, prev, d);
    }else{
      if(st !== null && O.randf(stPrev.stab + st.stab) < stPrev.stab)
        return null;

      var id = null;
      var stab = 1;
    }

    var sts = [new Meadow(id, stab)];

    var n = 2 + O.rand(15);
    if(O.rand(200) === 0) sts.push(new Forest(null, n, O.rand(n), O.rand(n)));

    return sts;
  }
};

class Forest extends structs.Structure{
  constructor(id, n, x, y){
    var dirs =
      ((y !== 0) << 0) |
      ((x !== n - 1) << 1) |
      ((y !== n - 1) << 2) |
      ((x !== 0) << 3);

    super(id, dirs);

    this.n = n;
    this.x = x;
    this.y = y;

    var {content} = this;
    if(x === 0 || y === 0 || x === n - 1 || y === n - 1)
      content.set(new Tree());
  }

  static gen(stPrev, st, dir, prev, d){
    var n = stPrev.n;
    var sts = [];

    var {x, y} = stPrev;
    dir = dir + 2 & 3;

    if(dir === 0) y--;
    else if(dir === 1) x++;
    else if(dir === 2) y++;
    else if(dir === 3) x--;

    if(x === -1 || y === -1 || x === n || y === n)
      return sts;

    sts.push(new Forest(stPrev.id, n, x, y));
    return sts;
  }
};

class Grass extends objs.Floor{
  constructor(st, m){
    super();
    this.st = st;
  }

  draw(g){
    var m = O.bound(this.st.stab, 0, 1) * 255;
    this.col = new O.Color(0, m, 0).toString();

    g.fillStyle = this.col;
    g.fillRect(0, 0, 1, 1);
  }
};

class Tree extends objs.Wall{
  constructor(){
    super();
  }

  draw(g){
    g.fillStyle = '#802000';
    g.beginPath();
    g.rect(.4, .25, .2, .75);
    g.fill();
    g.stroke();

    g.fillStyle = '#008000';
    g.beginPath();
    g.arc(.5, .25, .25, 0, O.pi2);
    g.fill();
    g.stroke();
  }
};

Meadow.Forest = Forest;
Meadow.Grass = Grass;
Meadow.Tree = Tree;

module.exports = Meadow;