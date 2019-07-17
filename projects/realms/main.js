'use strict';

const RenderEngine = require('./render-engine');
const Realm = require('./realm');
const WorldGenerator = require('./world-generator');
const RealmGenerator = require('./realm-generator');
const PredicateSet = require('./predicate-set');
const Event = require('./event');
const Transition = require('./transition');
const LayerPool = require('./layer-pool');
const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const realmsList = require('./realms-list');
const realms = require('./realms');

main();

function main(){
  if(0){
    O.enhanceRNG();
    O.randSeed(0);
  }

  O.body.style.margin = '0px';
  O.body.style.overflow = 'hidden';

  const canvas = O.ce(O.body, 'canvas');
  canvas.width = O.iw;
  canvas.height = O.ih;

  const reng = new RenderEngine(canvas, Grid.SquareGrid);
  const {grid} = reng;

  new WorldGenerator(grid);
}