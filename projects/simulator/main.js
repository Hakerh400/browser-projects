'use strict';

const RenderEngine = require('./render-engine');
const Shape = require('./shape');

// TODO: Linter: forbid double semicolons and warn about unresolved TODO-s

const w = window.innerWidth;
const h = window.innerHeight;
const [wh, hh] = [w, h].map(a => a / 2);

window.setTimeout(main);

async function main(){
  O.body.style.margin = '0px';
  O.body.style.overflow = 'hidden';

  const canvas3D = createCanvas();
  const reng = new RenderEngine(canvas3D);
  await reng.init();

  const canvas2D = createCanvas();
  const g = canvas2D.getContext('2d');
  g.textBaseline = 'top';
  g.textAlign = 'left';

  render();

  function render(){
    g.clearRect(0, 0, w, h);

    let fps = 1e3 / O.z + .5 | 0;
    if(fps > 55) fps = 60;
    g.font = '32px arial';
    g.fillStyle = 'black';
    g.fillText(`FPS: ${fps}`, 5, 5);

    const s = 10;
    g.strokeStyle = 'white';
    g.beginPath();
    g.moveTo(wh, hh - s);
    g.lineTo(wh, hh + s);
    g.moveTo(wh - s, hh);
    g.lineTo(wh + s, hh);
    g.stroke();

    O.raf(render);
  }
}

function createCanvas(){
  const canvas = O.ce(O.body, 'canvas');

  canvas.width = w;
  canvas.height = h;

  canvas.style.position = 'absolute';
  canvas.style.left = '0px';
  canvas.style.top = '0px';

  return canvas;
}