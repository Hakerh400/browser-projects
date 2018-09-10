'use strict';

const TileContent = require('./tile-content');

const {types} = TileContent;

class TileObject{
  draw(g){}
  type(){ return null; }
};

class Floor extends TileObject{
  type(){ return types.FLOOR; }
};

class Pickup extends TileObject{
  type(){ return types.PICKUP; }
};

class Wall extends TileObject{
  type(){ return types.WALL; }
};

class Object extends TileObject{
  type(){ return types.OBJECT; }
};

class Entity extends TileObject{
  type(){ return types.ENTITY; }
};

module.exports = {
  TileObject,
  Floor,
  Pickup,
  Wall,
  Object,
  Entity,
};