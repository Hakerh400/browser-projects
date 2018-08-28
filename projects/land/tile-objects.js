'use strict';

const TileContent = require('./tile-content');

const {types} = TileContent;

class TileObject{
  constructor(tex=null){
    this.tex = tex;
  }

  tick(grid, x, y){}
  draw(grid, x, y, g){}

  type(){ return null; }
};

class Floor extends TileObject{
  constructor(tex=null){
    super(tex);
  }

  type(){ return types.FLOOR; }
};

class Pickup extends TileObject{
  constructor(tex=null){
    super(tex);
  }

  type(){ return types.PICKUP; }
};

class Wall extends TileObject{
  constructor(tex=null){
    super(tex);
  }

  type(){ return types.WALL; }
};

class Entity extends TileObject{
  constructor(tex=null){
    super(tex);
  }

  type(){ return types.ENTITY; }
};

module.exports = {
  TileObject,
  Floor,
  Pickup,
  Wall,
  Entity,
};