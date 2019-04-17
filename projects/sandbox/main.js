'use strict';

const Tile = require('./tile');
const Layer = require('./layer');
const Object = require('./object');

const w = 16;
const h = 10;
const s = 40;

window.setTimeout(main);

function main(){
  const canvas = O.ce(O.body, 'canvas');
  canvas.style.marginLeft = '100px';
  canvas.style.borderRight = '1px solid';
  canvas.style.borderBottom = '1px solid';
  canvas.width = w * s;
  canvas.height = h * s;

  const ctx = canvas.getContext('2d');
  const g = new O.EnhancedRenderingContext(ctx);

  const gui = new O.GridUI(g, w, h, s);
  const {grid} = gui;

  grid.iter((x, y) => {
    const d = new Tile(grid, x, y);
    grid.set(x, y, d);

    const obj = new (O.randElem([
      Object.Chasm,
      Object.Water,
      Object.Lava,
    ]))(d);
  });

  O.repeat(Object.layersNum, layer => {
    gui.on('draw', draw.bind(null, layer));
  });

  // Draw lines manually instead of this
  gui.on('frame', () => 1);

  gui.on('lmb', (x, y) => {
    let d;
    if(d = grid.get(x, y)) d.a = 1;
  });

  gui.on('rmb', (x, y) => {
    let d;
    if(d = grid.get(x, y)) d.a = 0;
  });

  gui.on('dragl', (xp, yp, x, y) => {
    let d;
    if(d = grid.get(xp, yp)) d.a = 1;
    if(d = grid.get(x, y)) d.a = 1;
  });

  gui.on('dragr', (xp, yp, x, y) => {
    let d;
    if(d = grid.get(xp, yp)) d.a = 0;
    if(d = grid.get(x, y)) d.a = 0;
  });

  gui.render();
}

function draw(layer, g, d, x, y){
  d.draw(layer, g);
}