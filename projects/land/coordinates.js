'use strict';

class Coordinates{
  constructor(tile){
    this.tile = tile;
  }

  isFarEnough(){}
};

class CartesianCoordinates extends Coordinates{
  constructor(tile, x, y){
    super(tile);

    this.x = x;
    this.y = y;
  }

  isFarEnough(){
    var {grid} = this.tile;
    return x < grid.xMin || y < grid.yMin || x > grid.xMax || y > grid.yMax;
  }
};

module.exports = {
  Coordinates,
  CartesianCoordinates,
};