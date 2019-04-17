'use strict';

const rowSize = 2;

class Material{
  constructor(index){
    this.x = index % rowSize / rowSize;
    this.y = (index / rowSize | 0) / rowSize;
  }
};

Object.assign(Material, {
  grass: new Material(0),
  stone: new Material(1),
  entity: new Material(3),
});

module.exports = Material;