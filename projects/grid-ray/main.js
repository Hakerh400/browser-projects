'use strict';

const Ray = require('./ray');

const s = 40;

const {w, h, g} = O.ceCanvas(1);
const [ws, hs] = [w, h].map(a => Math.ceil(a / s));

window.setTimeout(main);

const cols = {
  bg: '#ffffff',
  marked: '#ffac60',
  lines: {
    default: '#000000',
    bg: '#e0e0e0',
    ray: '#000000',
    marked: '#000000',
  },
  points: {
    p1: '#00ff00',
    p2: '#00ffff',
  },
};

var p1 = null;
var p2 = null;

function main(){
  aels();
  render();
}

function aels(){
  O.ael('mousedown', evt => {
    const {clientX: x, clientY: y} = evt;

    switch(evt.button){
      case 0: p1 = new O.Vector(x, y); break;
      case 2: p1 = null; break;
    }
  });

  O.ael('mousemove', evt => {
    const {clientX: x, clientY: y} = evt;

    if(p2 === null) p2 = new O.Vector(x, y);
    else p2.set(x, y);
  });

  O.ael('contextmenu', evt => {
    evt.preventDefault();
  });
}

function render(){
  g.fillStyle = cols.bg;
  g.fillRect(0, 0, w, h);

  g.strokeStyle = cols.lines.bg;
  g.beginPath();

  for(var x = 0; x < w; x += s){
    g.moveTo(x, 0);
    g.lineTo(x, h);
  }

  for(var y = 0; y < h; y += s){
    g.moveTo(0, y);
    g.lineTo(w, y);
  }

  g.stroke();

  if(p1 !== null && p2 !== null){
    var angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    var ray = new Ray(p1.x / s, p1.y / s, angle);
    mark(ray.x, ray.y);

    const m = new O.Vector(0, 0);

    O.repeat(20, i => {
      ray.move();
      mark(ray.x, ray.y);

      m.set((ray.x + ray.dx) * s, (ray.y + ray.dy) * s);
      drawPoint(m, 3, O.Color.from(O.hsv(i / 20)));
    });

    g.strokeStyle = cols.lines.ray;
    g.beginPath();
    g.moveTo(p1.x, p1.y);
    g.lineTo(p2.x, p2.y);
    g.stroke();

    drawP(1);
    drawP(2);
  }

  O.raf(render);
}

function mark(x, y){
  g.fillStyle = cols.marked;
  g.strokeStyle = cols.lines.marked;
  g.beginPath();
  g.rect(x * s, y * s, s, s);
  g.fill();
  g.stroke();
}

function drawPoint(p, r, col){
  g.fillStyle = col;
  g.strokeStyle = cols.lines.default;
  g.beginPath();
  g.arc(p.x, p.y, r, 0, O.pi2);
  g.fill();
  g.stroke();
}

function drawP(type){
  switch(type){
    case 1: if(p1 !== null) drawPoint(p1, 5, cols.points.p1); break;
    case 2: if(p2 !== null) drawPoint(p2, 5, cols.points.p2); break;
  }
}