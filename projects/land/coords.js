'use strict';

class CoordinatesCollection{
  constructor(){
    this.map = new O.Map2D();
    this.arr = [];
  }

  has(x, y){
    return this.map.has(x, y);
  }

  add(x, y){
    var {map, arr} = this;
    if(map.has(x, y)) return;

    map.add(x, y);
    arr.push(x, y);
  }

  rand(cs){
    var {map, arr} = this;
    if(arr.length === 0) return null;

    var len = arr.length;
    var index = O.rand(len) & ~1;

    var x = arr[index];
    var y = arr[index + 1];

    if(len !== 2){
      arr[index] = arr[len - 2];
      arr[index + 1] = arr[len - 1];
    }

    arr.length = len - 2;
    map.remove(x, y);

    cs[0] = x;
    cs[1] = y;

    return cs;
  }
};

module.exports = CoordinatesCollection;