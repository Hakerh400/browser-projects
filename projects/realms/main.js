'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const realmsList = require('./realms-list');
const realms = require('./realms');

setTimeout(main);

function main(){
  const grid = new Grid.SquareGrid();

  grid.get(-1, 0);
  grid.get(1, 0);

  log(grid.get(0, 0).adjRaw(0));
  log(grid.get(0, 0).adjRaw(1));
  log(grid.get(0, 0).adjRaw(2));
  log(grid.get(0, 0).adjRaw(3));
}