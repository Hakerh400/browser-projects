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
  O.body.style.overflow = 'hidden';

  const canvas = O.ce(O.body, 'canvas');
  canvas.width = 640;
  canvas.height = 480;
  canvas.style.marginLeft = '100px';
  canvas.style.marginTop = '20px';

  const reng = new RenderEngine(canvas, Grid.SquareGrid);
}