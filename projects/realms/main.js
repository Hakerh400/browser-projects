'use strict';

const RenderEngine = require('./render-engine');
const Action = require('./action');
const Transition = require('./transition');
const LayerPool = require('./layer-pool');
const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const realmsList = require('./realms-list');
const realms = require('./realms');

setTimeout(main);

function main(){
  O.body.style.margin = '0px';
  O.body.style.overflow = 'hidden';

  const canvas = O.ce(O.body, 'canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const reng = new RenderEngine(canvas, Grid.HexagonalGrid);
  const {grid} = reng;

  grid.on('gen', tile => {
    new Object.Ground(tile);
  });

  grid.on('reset', tile => {
    new Object.Ground(tile);
  });

  O.repeat(10, i => {
    new Object.Entity(grid.get(i - 10, -11));
    new Object.Pickup(grid.get(i, 11));
  });

  O.repeat(20, i => {
    const tile = grid.get(O.rand(-10, 10), O.rand(-10, 10));
    if(tile.has.occupying || tile.has.pickup) return;
    new Object.Wall(tile);
  });
}