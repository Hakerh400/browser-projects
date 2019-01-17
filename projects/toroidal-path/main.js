'use strict';

const Solver = require('./solver');
const Tile = require('./tile');

const AUTO = 1;

const w = 45;
const h = 21;
const s = 40;

const density = .05;

O.enhanceRNG();
const seed = O.urlParam('seed');
if(seed !== null)
  O.randSeed(seed);

const gui = new O.GridGUI(w, h, s, initFunc);
const {grid, keys, cur} = gui;

let solving = 0;
let solver = null;

window.setTimeout(main);

function main(){
  const highlighted = new O.Map2D();

  let colorized = 0;

  gui.on('draw', (g, d, x, y) => {
    g.fillStyle = '#ccc';
    g.fillRect(0, 0, 1, 1);

    g.strokeStyle = '#bbb';
    g.beginPath();
    g.moveTo(1, 0);
    g.lineTo(0, 0);
    g.lineTo(0, 1);
    g.stroke();
    g.strokeStyle = 'black';
  });

  gui.on('draw', (g, d, x, y) => {
    const col =
      d.wall ? '#840' :
      d.locked ? '#888' :
      colorized && ((1 << d.dirs) & 279) ?
        (x ^ y) & 1 ? '#f08' : '#0ff' :
      null;

    if(col !== null){
      g.fillStyle = col;
      g.fillRect(0, 0, 1, 1);
    }

    if(!d.wall){
      const {dirs} = d;

      g.fillStyle = highlighted.has(x, y) ? '#ff0' : '#0f0';
      
      if(dirs !== 0)
        g.drawTube(0, 0, dirs, .3);
    }
  });

  gui.on('frame', (g, d1, d2, x, y, dir) => {
    if(d2 === null) return 1;
    return d1.wall ^ d2.wall;
  });

  gui.on('kF2', (x, y) => {
    generate(grid);
    colorized = 0;
    solving = 0;
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
    colorized ^= 1;
  });

  gui.on('kKeyS', () => {
    if(!solving){
      solver = new Solver(gui);
      solving = 1;
      colorized = 0;
    }

    if(!solver.move()){
      solving = 0;
      solver = null;
    }
  });

  gui.on('kKeyA', () => {
    solver = new Solver(gui);
    colorized = 0;

    while(solver.move());

    if(!solver.solved){
      grid.iter((x, y, d) => {
        d.dirs = 0;
      });
    }

    colorized = 0;
    solving = 0;
    solver = null;
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

  if(AUTO){
    let started = 0;

    const next = () => {
      do{
        generate(grid);
        colorized = 0;
        solving = 0;
        highlighted.reset();
      }while(!check());

      started = 0;
    };

    const start = () => {
      grid.iter((x, y, d) => d.dirs = 0);

      solver = new Solver(gui);
      solving = 1;
      colorized = 0;
      started = 1;
    };

    const check = () => {
      solver = new Solver(gui);
      colorized = 0;

      while(solver.move());
      const {solved} = solver;

      grid.iter((x, y, d) => d.dirs = 0);

      colorized = 0;
      solver = null;

      return solved;
    };

    const move = () => {
      if(!solving) return;

      if(!solver.move()){
        solving = 0;
        solver = null;
      }
    };

    gui.on('tick', () => {
      move();
    });

    gui.on('kEnter', () => {
      start();
    });

    gui.on('kArrowRight', () => {
      next();
    });

    next();
  }

  gui.on('kKeyM', () => {
    location.href = location.href.replace(/\d+$/, a => -~a);
  });

  gui.render();
}

function generate(grid){
  grid.iter(genFunc);
}

function initFunc(x, y){
  const d = new Tile();
  genFunc(x, y, d);
  return d;
}

function genFunc(x, y, d){
  d.wall = O.randf() < density;
  d.dirs = 0;
  d.locked = 0;
}