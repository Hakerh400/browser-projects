'use strict';

const types = O.enum([
  'FLOOR',
  'PICKUP',
  'WALL',
  'OBJECT',
  'ENTITY',
]);

class TileContent{
  constructor(){
    this.d = O.obj();
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
};

TileContent.types = types;

module.exports = TileContent;