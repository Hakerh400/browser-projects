'use strict';

class Tile{
  constructor(grid, coords, adj){
    this.grid = grid;
    this.coords = coords;
    this.adj = adj;
  }

  static emptyAdj(num){
    var arr = [];
    while(num-- !== 0) arr.push(null);
    return arr;
  }

  isFarEnoguh(){
    return this.coords.isFarEbough();
  }
};

class Triangle extends Tile{
  constructor(grid, coords){
    super(grid, coords, Tile.emptyAdj(3));
  }
};

class Square extends Tile{
  constructor(grid, coords){
    super(grid, coords, Tile.emptyAdj(4));
  }
};

class Pentagon extends Tile{
  constructor(grid, coords){
    super(grid, coords, Tile.emptyAdj(5));
  }
};

class Hexagon extends Tile{
  constructor(grid, coords){
    super(grid, coords, Tile.emptyAdj(6));
  }
};

class Heptagon extends Tile{
  constructor(grid, coords){
    super(grid, coords, Tile.emptyAdj(7));
  }
};

module.exports = {
  Tile,
  Triangle,
  Square,
  Pentagon,
  Hexagon,
  Heptagon,
};