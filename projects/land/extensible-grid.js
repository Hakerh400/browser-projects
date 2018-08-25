'use strict';

class ExtensibleGrid extends O.SimpleGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, null, O.obj());

    this.resize(w, h);

    this.x = x;
    this.y = y;

    if(func !== null){
      this.iterate((x, y) => {
        this.set(x, y, func(x, y));
      });
    }
  }

  resize(w, h){
    this.w = w;
    this.h = h;
    this.wh = w / 2;
    this.hh = h / 2;
    this.whi = w >> 1;
    this.hhi = h >> 1;
  }

  iterate(xs, ys, func=null){
    if(func === null){
      func = xs;
      xs = this.x;
      ys = this.y;
    }

    var x1 = xs - this.whi;
    var y1 = ys - this.hhi;
    var x2 = x1 + this.w;
    var y2 = y1 + this.h;

    for(var y = y1; y !== y2; y++)
      for(var x = x1; x !== x2; x++)
        func(x, y, this.get(x, y));
  }

  get(x, y){
    if(!this.includes(x, y)) return null;
    return this.d[y][x];
  }

  set(x, y, val){
    var {d} = this;
    if(!(y in d)) d[y] = O.obj();
    d[y][x] = val;
  }

  includes(x, y){
    var {d} = this;
    return y in d && x in d[y];
  }

  move(x, y){
    this.x += x;
    this.y += y;
  }
};

module.exports = ExtensibleGrid;