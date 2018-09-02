'use strict';

class ExpandableGrid extends O.SimpleGrid{
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
  }

  iterate(...args){
    var xs = this.x;
    var ys = this.y;
    var expanded = 0;
    var func;

    switch(args.length){
      case 1: [func] = args; break;
      case 3: [xs, ys, func] = args; break;
      case 4: [xs, ys, expanded, func] = args; break;
    }

    var {w, h} = this;

    if(expanded){
      w <<= 1;
      h <<= 1;
    }

    var x1 = xs - (w >> 1);
    var y1 = ys - (h >> 1);
    var x2 = x1 + w;
    var y2 = y1 + h;

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

module.exports = ExpandableGrid;