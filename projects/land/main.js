'use strict';

const SCALE = 40;

const w = Math.floor(innerWidth / SCALE) + 4;
const h = Math.floor(innerHeight / SCALE) + 4;

const LandGrid = require('./land-grid');
const RenderingEngine = require('./rendering-engine');

var grid = null;
var engine = null;

window.setTimeout(main);

function main(){
  grid = new LandGrid(w, h);
  engine = new RenderingEngine(grid, SCALE);

  engine.render();

  aels();
}

function aels(){
  ael('keydown', evt => {
    switch(evt.code){
      case 'ArrowUp': engine.move(0, -1); break;
      case 'ArrowRight': engine.move(1, 0); break;
      case 'ArrowDown': engine.move(0, 1); break;
      case 'ArrowLeft': engine.move(-1, 0); break;
    }
  });
}

function ael(type, func){
  O.ael(type, func);
}