'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const games = require('./games-list');

setTimeout(main);

function main(){
  const grid = new Grid.SquareGrid();
  const d = new Tile.SquareTile(grid, 2);
}