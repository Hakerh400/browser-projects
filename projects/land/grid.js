'use strict';

const tileCtors = require('./tile');
const entCtors = require('./entity');
const coordsCtors = require('./coordinates');

class Grid{
  constructor(world){
    this.world = world;

    this.xMin = -world.w / world.s / 2;
    this.xMax = -this.xMin;

    this.yMin = -world.y / world.s / 2;
    this.yMax = -this.yMin;

    this.g = world.g;

    this.mainTile = null;
    this.generate();
  }

  generate(){
    if(this.mainTile === null){
      this.mainTile = new Tile(this, 0, 0, O.randf(1));
    }

    var {coords} = this.mainTile;
    coords.x = 0;
    coords.y = 0;

    var queue = [this.mainTile];
    var visited = new Set(queue);

    while(queue.length !== 0){
      var tile = queue.shift();
      if(tile.isFarEnough()) continue;

      tile.adj.forEach((adj, i) => {
        if(adj === null){
        }
      });
    }
  }
};

class Tile extends tileCtors.Square{
  constructor(grid, x, y, land, ents=[]){
    super(grid, null);

    this.coords = new Coords(this, x, y);

    this.land = land;
    this.ents = ents;
  }
};

const Coords = coordsCtors.CartesianCoordinates;

module.exports = Grid;