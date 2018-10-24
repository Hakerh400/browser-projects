'use strict';

window.setTimeout(main);

const w = Math.round(window.innerWidth / 10);
const h = Math.round(window.innerHeight / 10);

const g = createContext();
const imgd = g.createImageData(w, h);
const {data} = imgd;

function main(){
  O.body.classList.add('has-canvas');
  O.body.style.backgroundColor = '#000000';

  for(var i = 3; i < data.length; i += 4)
    data[i] = 255;

  render();
}

function render(){
  for(var i = 0, y = 0; y !== h; y++){
    for(var x = 0; x !== w; x++, i += 4){
      data[i] = (Date.now() / 100 ^ x ^ y) & 255;
      data[i + 1] = 0;
      data[i + 2] = 0;
    }
  }

  g.putImageData(imgd, 0, 0);

  O.raf(render);
}

function createContext(){
  const canvas = O.ce(O.body, 'canvas');

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = w;
  canvas.height = h;

  return canvas.getContext('2d');
}