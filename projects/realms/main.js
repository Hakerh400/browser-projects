'use strict';

const RenderEngine = require('./render-engine');
const Event = require('./event');
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

  const reng = new RenderEngine(canvas, Grid.SquareGrid);
  const {grid} = reng;

  grid.on('gen', tile => {
    new Object.Ground(tile);
  });

  grid.on('reset', tile => {
    new Object.Ground(tile);
  });

  O.repeat(10, i => {
    new Object.NPC(grid.get(i - 10, -11));
    new Object.Pickup(grid.get(i, 11));
  });

  O.repeat(20, i => {
    const tile = grid.get(O.rand(-10, 10), O.rand(-10, 10));
    if(tile.has.occupying || tile.has.pickup) return;
    new Object.Wall(tile);
  });

  for(let y = -1; y <= 1; y++)
    for(let x = -1; x <= 1; x++)
      new Object.Player(grid.get(x, y).reset());
}