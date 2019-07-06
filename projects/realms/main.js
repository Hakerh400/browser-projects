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

  grid.on('reset', resetTile);
  grid.on('gen', genTile);

  new realms.sokoban.Player(grid.get(0, 0).reset());
}

function resetTile(tile){
  const {x, y} = tile;

  new realms.sokoban.Floor(tile, 0);
}

function genTile(tile){
  const {x, y} = tile;
  
  new realms.sokoban.Floor(tile, O.rand(2));
  if(O.rand(2)) new realms.sokoban.Box(tile, O.rand(2));
}