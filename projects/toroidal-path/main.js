'use strict';

const Tile = require('./tile');

const w = 15;
const h = 15;

window.setTimeout(main);

function main(){
  const gui = new O.GridGUI(w, h, () => {
    return new Tile();
  });

  const {grid, keys, cur} = gui;

  generate(grid);

  gui.on('draw', (g, d, x, y) => {
    g.fillStyle = d.wall ? '#840' : d.locked ? '#888' : '#ccc';
    g.fillRect(0, 0, 1, 1);

    if(!d.wall){
      let dirs = d.dirs;

      if(keys.KeyA){
        if(d.locked){
          dirs = 0;
        }else{
          if((x ^ y ^ cur.x ^ cur.y) & 1) dirs ^= 15;
          if(x <= cur.x) dirs ^= 8;
          if(x >= cur.x) dirs ^= 2;
          if(y <= cur.y) dirs ^= 1;
          if(y >= cur.y) dirs ^= 4;
        }

        grid.adj(x, y, (x, y, d, dir) => {
          if(!d) return;

          if(d.wall || d.locked)
            dirs &= ~(1 << dir);
        });

        g.fillStyle = '#f80';
      }else{
        g.fillStyle = '#0f0';
      }

      g.drawTube(0, 0, dirs, .25);
    }
  });

  gui.on('frame', (g, d1, d2, x, y, dir) => {
    if(d2 === null) return 1;
    return !(d1.wall && d2.wall);
  });

  gui.on('kKeyR', (x, y) => {
    generate(grid);
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

function generate(grid){
  const minNum = w * h * .75;

  mainLoop: while(1){
    const sx = O.rand(w);
    const sy = O.rand(h);

    const vs = new O.Map2D(sx, sy);

    let x = sx, y = sy;
    let num = 0;

    do{
      const adj = [];

      grid.adj(x, y, (xn, yn) => {
        xn = (xn + w) % w;
        yn = (yn + w) % h;

        if(xn === sx && yn === sy || !vs.has(xn, yn))
          adj.push(xn, yn);
      });

      if(adj.length === 0)
        continue mainLoop;

      const i = O.rand(adj.length >> 1) << 1;

      x = adj[i], y = adj[i + 1];
      vs.add(x, y);
      num++;
    }while(!(x === sx && y === sy));

    grid.iter((x, y, d) => {
      d.wall = !vs.has(x, y);
      d.dirs = 0;
      d.locked = 0;
    });

    if(num < minNum) continue;
    break;
  };
}