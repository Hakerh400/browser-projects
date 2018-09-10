'use strict';

const structs = require('../structs');
const TileContent = require('../tile-content');
const objs = require('../tile-objects');

class Meadow extends structs.Biome{
  constructor(stab){
    super(stab);
    
    var {content} = this;
    content.set(new Grass());
  }

  static gen(stPrev, st, dir, prev, d){
    var sts = [new Meadow()];
    if(O.rand(200) === 0) sts.push(new Forest(O.rand(5), O.rand(5)));
    return sts;
  }
};

class Forest extends structs.Structure{
  constructor(x, y){
    var dirs =
      ((y !== 0) << 0) |
      ((x !== 4) << 1) |
      ((y !== 4) << 2) |
      ((x !== 0) << 3);

    super(dirs);

    this.x = x;
    this.y = y;

    var {content} = this;
    if(x === 0 || y === 0 || x === 4 || y === 4)
      content.set(new Tree());
  }

  static gen(stPrev, st, dir, prev, d){
    var sts = [];

    var {x, y} = stPrev;
    dir = dir + 2 & 3;

    if(dir === 0) y--;
    else if(dir === 1) x++;
    else if(dir === 2) y++;
    else if(dir === 3) x--;

    if(x === -1 || y === -1 || x === 5 || y === 5)
      return sts;

    sts.push(new Forest(x, y));
    return sts;
  }
};

class Grass extends objs.Floor{
  constructor(){
    super();
    this.col = new O.Color(0, 0xC0 + O.rand(0x40), 0).toString();
  }

  draw(g){
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

module.exports = Meadow;