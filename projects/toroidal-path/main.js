'use strict';

const Tile = require('./tile');

const w = 11;
const h = 11;

window.setTimeout(main);

function main(){
  const gui = new O.GridGUI(w, h, () => {
    return new Tile(O.randf(1) < .1);
  });

  const {grid} = gui;

  gui.on('draw', (g, d, x, y) => {
    g.fillStyle = d.wall ? '#840' : d.locked ? '#808080' : '#c0c0c0';
    g.fillRect(0, 0, 1, 1);

    if(!d.wall){
      g.fillStyle = '#0f0';
      g.drawTube(0, 0, d.dirs, .25);
    }
  });

  gui.on('frame', (g, d1, d2, x, y, dir) => {
    if(d2 === null) return 1;
    return !(d1.wall && d2.wall);
  });

  gui.on('kSpace', (x, y) => {
    if(!grid.has(x, y)) return;
    grid.get(x, y).toggleLock();
  });

  gui.on('dragl', (x1, y1, x2, y2, dir) => {
    if(!grid.has(x1, y1)) return;

    x2 = (x2 + w) % w;
    y2 = (y2 + h) % h;

    const d1 = grid.get(x1, y1);
    const d2 = grid.get(x2, y2);

    if(d1.wall || d2.wall) return;
    if(d1.locked || d2.locked) return;

    d1.dirs |= 1 << dir;
    d2.dirs |= 1 << (dir ^ 2);
  });

  gui.on('dragr', (x1, y1, x2, y2, dir) => {
    if(!grid.has(x1, y1)) return;

    x2 = (x2 + w) % w;
    y2 = (y2 + h) % h;

    const d1 = grid.get(x1, y1);
    const d2 = grid.get(x2, y2);

    if(d1.wall || d2.wall) return;
    if(d1.locked || d2.locked) return;

    d1.dirs &= ~(1 << dir);
    d2.dirs &= ~(1 << (dir ^ 2));
  });

  gui.render();
}