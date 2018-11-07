'use strict';

class CoordinatesCollection{
  constructor(x=null, y=null){
    this.map = new O.Map2D();
    this.arr = [];

    if(x !== null)
      this.add(x, y);
  }

  reset(){
    this.map.reset();
    this.arr.length = 0;
    return this;
  }

  has(x, y){
    if(x instanceof O.Vector) ({x, y} = x);
    return this.map.has(x, y);
  }

  add(x, y){
    if(x instanceof O.Vector) ({x, y} = x);

    const {map, arr} = this;
    if(map.has(x, y)) return;

    map.add(x, y);
    arr.push(x, y);
  }

  getByIndex(index, remove=0){
    const {map, arr} = this;

    var len = arr.length;
    var x = arr[index];
    var y = arr[index + 1];

    if(remove){
      if(len !== 2){
        arr[index] = arr[len - 2];
        arr[index + 1] = arr[len - 1];
      }

      arr.length = len - 2;
      map.remove(x, y);
    }
  }

  remove(x, y){
    if(x instanceof O.Vector) ({x, y} = x);

    const {arr} = this;

    for(var i = 0; i !== arr.length; i += 2){
      if(arr[i] === x && arr[i + 1] === y)
        break;
    }

    if(i === arr.length) return;
    this.getByIndex(i >> 1, remove);
  }

  rand(vec, remove=0){
    const {arr} = this;
    if(arr.length === 0) return null;

    var index = O.rand(arr.length) & ~1;
    vec.set(arr[index], arr[index + 1]);
    this.getByIndex(vec, index >> 1, remove);

    return vec;
  }

  forEach(func){
    this.arr.forEach(func);
  }

  isEmpty(){ return this.arr.length === 0; }
  len(){ return this.arr.length >> 1; }
};

module.exports = CoordinatesCollection;