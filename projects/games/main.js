'use strict';

// Enhance RNG
O.enhanceRNG();

/*
  This should be the first action. Let the CSS
  load in the background while we display
  the loading screen
*/
let hasCss = 0;
injectCss();

/*
  The number of all XHR requests that are intended
  to be performed directly or indirectly
*/
const modulesNum = 8;
O.module.remaining = modulesNum;

// Main and loading divs
const mainDiv = O.ce(O.body, 'div', 'main');
const loadingDiv = O.ce(mainDiv, 'div', 'loading');
injectLoading();

// Load modules
const Display = require('./display');

function main(){
}

function injectCss(){
  O.rfLocal('style.css', (status, data) => {
    if(status !== 200) return error('Cannot load CSS');
    const style = O.doc.createElement('style');
    style.innerHTML = data;
    O.head.appendChild(style);
    hasCss = 1;
  });
}

function injectLoading(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  const [wh, hh] = [w, h].map(a => a / 2);

  const canvas = O.ce(loadingDiv, 'canvas');
  canvas.width = w;
  canvas.height = h;

  const g = canvas.getContext('2d');
  g.translate(wh, hh);
  g.textBaseline = 'middle';
  g.textAlign = 'center';
  g.fillStyle = '#444';
  g.lineWidth = 20;

  let k = 0;

  render();

  function render(){
    g.save();
    g.resetTransform();
    g.clearRect(0, 0, w, h);
    g.restore();

    const f = .9;
    const f1 = 1 - f;

    const kk = 1 - O.module.remaining / modulesNum;
    
    k = k * f + kk * f1;
    const percent = k * 100 + .5 | 0;

    g.font = '100px arial';
    g.fillText(`${percent}%`, 0, 0);

    g.strokeStyle = '#ccc';
    g.beginPath();
    g.arc(0, 0, 200, 0, O.pi2);
    g.stroke();

    g.strokeStyle = '#444';
    g.beginPath();
    g.arc(0, 0, 200, -O.pih, k * O.pi2 - O.pih);
    g.stroke();

    if(k === 1)
      return main();

    O.raf(render);
  }
}

function error(err){
  O.error(err);
}