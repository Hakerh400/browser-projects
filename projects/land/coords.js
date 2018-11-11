'use strict';

class CoordinatesCollection{
  constructor(x=null, y=null){
    this.m = new O.Map2D();
    this.arr = [];

    if(x !== null)
      this.add(x, y);
  }

  reset(){
    this.m.reset();
    this.arr.length = 0;
    return this;
  }

  has(x, y){
    if(x instanceof O.Vector) ({x, y} = x);
    return this.m.has(x, y);
  }

  add(x, y){
    if(x instanceof O.Vector) ({x, y} = x);

    const {m, arr} = this;
    if(m.has(x, y)) return;

    m.add(x, y);
    arr.push(x, y);
  }

  get(index, vec=null, remove=0){
    const {m, arr} = this;

    index <<= 1;

    var len = arr.length;
    var x = arr[index];
    var y = arr[index + 1];

    if(remove || vec === null){
      if(len !== 2){
        arr[index] = arr[len - 2];
        arr[index + 1] = arr[len - 1];
      }

      arr.length = len - 2;
      m.remove(x, y);
    }

    if(vec === null) return null;
    return vec.set(x, y);
  }

  remove(x, y){
    if(x instanceof O.Vector) ({x, y} = x);

    const {arr} = this;

    for(var i = 0; i !== arr.length; i += 2)
      if(arr[i] === x && arr[i + 1] === y)
        break;

    if(i === arr.length) return;
    this.get(i >> 1);
  }

  rand(vec, remove=0){
    const {arr} = this;
    if(arr.length === 0) return null;

    var index = O.rand(arr.length >> 1);
    return this.get(index, vec, remove);
  }

  iterate(func){
    const {arr} = this;

    for(var i = 0, j = 0; i !== arr.length; i += 2, j++)
      if(func(arr[i], arr[i + 1], j))
        break;
  }

  forEach(func){
    this.iterate((x, y, i) => {
      func(x, y, i);
    });
  }

  map(func){
    const arr = [];

    this.iterate((x, y, i) => {
      arr.push(func(x, y, i));
    });

    return arr;
  }

  findIndex(func){
    var index = -1;

    this.iterate((x, y, i) => {
      if(func(x, y, i)){
        index = i;
        return 1;
      }
    });

    return index;
  }

  find(func, vec){
    return this.get(this.findIndex(func), vec);
  }

  isEmpty(){ return this.arr.length === 0; }
  len(){ return this.arr.length >> 1; }

  toString(){
    return this.map((x, y) => {
      return `(${x}, ${y})`;
    }).join('\n');
  }
};

module.exports = CoordinatesCollection;