'use strict';

const Tile = require('./tile');

const w = 21;
const h = 21;

window.setTimeout(main);

function main(){
  const gui = new O.GridGUI(w, h, () => {
    return new Tile();
  });

  const {grid, keys, cur} = gui;
  const highlighted = new O.Map2D();
  let colorized = 0;

  generate(grid);

  gui.on('draw', (g, d, x, y) => {
    g.fillStyle =
      d.wall ? '#840' :
      d.locked ? '#888' :
      colorized && (d.dirs === 0 || (1 << d.dirs) & 278) ?
        (x ^ y) & 1 ? '#f08' : '#0ff' :
      '#ccc';

    g.fillRect(0, 0, 1, 1);

    if(!d.wall){
      let dirs = d.dirs;

      if(keys.KeyA){
        if(d.locked){
          dirs = 0;
        }else{
          if(!((x ^ y ^ cur.x ^ cur.y) & 1))
            dirs ^= 15;
        }

        grid.adj(x, y, 1, (x, y, d, dir) => {
          if(!d) return;

          if(d.wall || d.locked)
            dirs &= ~(1 << dir);
        });

        g.fillStyle = '#f80';
      }else{
        g.fillStyle = highlighted.has(x, y) ? '#ff0' : '#0f0';
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
    colorized = 0;
    highlighted.reset();
  });

  gui.on('kSpace', (x, y) => {
    if(!grid.has(x, y)) return;
    grid.get(x, y).toggleLock();
  });

  gui.on('kKeyQ', (x, y) => {
    highlighted.reset();
    if(!grid.has(x, y)) return;

    const d = grid.get(x, y);
    if(d.wall) return;

    highlighted.add(x, y);

    grid.iterAdj(x, y, 1, (x, y, d, xp, yp, dir) => {
      const dp = grid.get(xp, yp);

      if(d.wall) return 0;
      if(!(dp.dirs & (1 << dir))) return 0;
      if(!(d.dirs & (1 << (dir ^ 2)))) return 0;

      highlighted.add(x, y);
      return 1;
    });
  });

  gui.on('kKeyW', (x, y) => {
    grid.iter((x, y, d) => {
      let dirs = (x ^ y) & 1 ? 3 : 12;

      grid.adj(x, y, 1, (x, y, d1, dir, wrapped) => {
        if(!d1) return;

        if(wrapped || d1.wall || d1.locked)
          dirs &= ~(1 << dir);
      });

      d.dirs = dirs;
    });
  });

  gui.on('kKeyE', (x, y) => {
    colorized ^= 1;
  });

  gui.on('dragl', (x1, y1, x2, y2, dir) => {
    if(!grid.has(x1, y1)) return;

    x2 = (x2 + w) % w;
    y2 = (y2 + h) % h;

    const d1 = grid.get(x1, y1);
    const d2 = grid.get(x2, y2);

    if(d1.wall || d2.wall) return;
    if(d1.locked || d2.locked) return;

    if(colorized){
      d1.dirs ^= 1 << dir;
      d2.dirs ^= 1 << (dir ^ 2);
    }else{
      d1.dirs |= 1 << dir;
      d2.dirs |= 1 << (dir ^ 2);
    }
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

  gui.on('dragm', (x1, y1, x2, y2, dir) => {
    if(!grid.has(x1, y1)) return;

    x2 = (x2 + w) % w;
    y2 = (y2 + h) % h;

    const d1 = grid.get(x1, y1);
    const d2 = grid.get(x2, y2);

    if(d1.wall || d2.wall) return;
    if(d1.locked || d2.locked) return;

    d1.dirs ^= 1 << dir;
    d2.dirs ^= 1 << (dir ^ 2);
  });

  gui.render();
}

function generate(grid){
  grid.iter((x, y, d) => {
    d.wall = O.randf() < .05;
    d.dirs = 0;
    d.locked = 0;
  });

  return;

  const minNum = w * h * .75;

  mainLoop: while(1){
    const sx = O.rand(w);
    const sy = O.rand(h);

    const vs = new O.Map2D(sx, sy);

    let x = sx, y = sy;
    let num = 0;

    do{
      const adj = [];

      grid.adj(x, y, 1, (xn, yn) => {
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