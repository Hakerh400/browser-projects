'use strict';

const RenderEngine = require('./render-engine');
const Realm = require('./realm');
const WorldGenerator = require('./world-generator');
const RealmGenerator = require('./realm-generator');
const Event = require('./event');
const Transition = require('./transition');
const LayerPool = require('./layer-pool');
const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const realmsList = require('./realms-list');
const realms = require('./realms');

const {isElectron} = O;
const isBrowser = !isElectron;

main();

function main(){
  if(isBrowser){
    const seed = O.urlParam('seed');
    if(seed === null) return refresh();

    O.enhanceRNG();
    O.randSeed(seed);

    O.ael('keydown', evt => {
      switch(evt.code){
        case 'F5':
          O.pd(evt);
          refresh();
          break;
      }
    });
  }

  O.body.style.margin = '0px';
  O.body.style.overflow = 'hidden';

  const canvas = O.ce(O.body, 'canvas');
  canvas.width = O.iw;
  canvas.height = O.ih;

  const reng = new RenderEngine(canvas, Grid.SquareGrid);
  const {grid} = reng;

  new WorldGenerator(grid, tile => {
    const {x, y} = tile;

    const r1 = ['sokoban', 'a'];
    const r2 = ['sudoku', 'a'];
    if(x === 0 && y === 0) return r1;

    return x <= 0 ? r1 : r2;
  });

  grid.get(0, 0);
}

function refresh(){
  const url = location.href;

  location.href = url.replace(/\bseed=(?:[^\&]|$)*|$/, a => {
    const seed = O.rand(2 ** 30);
    const c = a.length === 0 ? url.includes('?') ? '&' : '?' : '';

    return `${c}seed=${seed}`;
  });
}