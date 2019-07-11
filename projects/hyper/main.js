'use strict';

const {g, w, h, wh, hh} = O.ceCanvas();

const {min, max} = Math;

setTimeout(main);

function main(){
  g.fillStyle = '#000';
  g.fillRect(0, 0, w, h);

  const s = min(w, h) * .9;
  g.translate(wh, hh);
  g.scale(s, s);

  g.fillStyle = '#fff';
  g.beginPath();
  g.arc(0, 0, .5, 0, O.pi2);
  g.fill();
}