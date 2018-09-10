'use strict';

const typeNames = [
  'FLOOR',
  'PICKUP',
  'WALL',
  'OBJECT',
  'ENTITY',
];

const types = O.enum(typeNames);

class TileContent{
  constructor(){
    this.d = O.obj();
  }

  static concat(arr, forward=1){
    var dNew = new TileContent();

    var start = forward ? 0 : arr.length - 1;
    var end = forward ? arr.length - 1 : 0;
    var diff = forward ? 1 : -1;

    for(var i = start;; i += diff){
      var d = arr[i];

      d.forEach(obj => {
        if(dNew.has(obj.type())) return;
        dNew.set(obj);
      });

      if(i === end) break;
    }

    return dNew;
  }

  draw(g){
    this.forEach(obj => obj.draw(g));
  }

  forEach(func){
    for(var i = 0; i !== typeNames.length; i++){
      if(!this.has(i)) continue;
      func(this.get(i));
    }
  }

  get(type){
    var {d} = this;
    if(!(type in d)) return null;
    return d[type];
  }

  set(tileObj){
    this.d[tileObj.type()] = tileObj;
  }

  remove(type){
    delete d[type];
  }

  has(type){
    return type in this.d;
  }
};

TileContent.types = types;

module.exports = TileContent;