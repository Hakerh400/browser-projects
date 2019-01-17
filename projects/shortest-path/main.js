'use strict';

const w = 10;
const h = 10;
const s = 40;

window.setTimeout(main);

function main(){
  const gui = new O.GridGUI(w, h, s, (x, y) => {
    return new Tile(O.randf() < .05, 0);
  });

  const {grid} = gui;
  const ps = [];
  const cc = new O.CoordsColle();

  gui.on('draw', (g, d, x, y) => {
    g.fillStyle = 'white';
    g.fillRect(0, 0, 1, 1);

    g.strokeStyle = '#ccc';
    g.beginPath();
    g.rect(0, 0, 1, 1);
    g.stroke();
    g.strokeStyle = 'black';
  });

  gui.on('draw', (g, d, x, y) => {
    if(d.wall){
      g.fillStyle = '#800';
      g.fillRect(0, 0, 1, 1);
      return;
    }

    if(cc.has(x, y)){
      g.fillStyle = '#f80';
      g.beginPath();
      g.arc(.5, .5, .4, 0, O.pi2);
      g.fill();
      g.stroke();
      return;
    }

    if(d.dirs){
      g.fillStyle = '#0f0';
      g.drawTube(0, 0, d.dirs, .3);
    }
  });

  gui.on('frame', (g, d1, d2, x, y, dir) => {
    if(!d2 || (d1.wall ^ d2.wall)) return 1;
    return 0;
  });

  gui.on('lmb', (x, y) => {
    const d = grid.get(x, y);
    if(!d || d.wall) return;

    if(ps.length === 4){
      ps.length = 0;
      cc.reset();
      grid.iter((x, y, d) => d.dirs = 0);
    }

    ps.push(x, y);
    cc.add(x, y);

    if(ps.length === 4) findPath();
  });

  gui.render();

  function findPath(){
    const [x1, y1, x2, y2] = ps;

    const path = grid.path(x1, y1, 0, 0, (x, y, d, xp, yp, dir, wrapped, path) => {
      if(d === null) return 0;
      if(d.wall) return 0;
      if(x === x2 && y === y2) return 2;
      return 1;
    });

    if(!path) return;

    const v = new O.Vector(x1, y1);

    for(const dir of path){
      grid.get(v.x, v.y).dirs |= 1 << dir;
      grid.nav(v, dir);
      grid.get(v.x, v.y).dirs |= 1 << (dir ^ 2);
    }
  }
}

class Tile{
  constructor(wall, dirs){
    this.wall = wall;
    this.dirs = dirs;
  }
};