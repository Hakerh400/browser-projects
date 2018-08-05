'use strict';

class Entity{
  constructor(tile){
    this.tile = tile;
  }
};

class Player extends Entity{
  constructor(tile){
    super(tile);
  }
};

module.exports = {
  Entity,
  Player,
};