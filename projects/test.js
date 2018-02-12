'use strict';

var {w, h, g} = O.ceCanvas();

window.setTimeout(main);

function main(){
  g.fillStyle = 'white';
  g.fillRect(0, 0, w, h);

  var s = 100;
  var s2 = s << 1;

  g.fillStyle = 'red';
  g.beginPath();
  g.moveTo(s, s);

  g.lineTo(s2, s);
  g.moveTo(s2, s);

  g.lineTo(s2, s2);
  g.moveTo(s2, s2);

  g.lineTo(s, s2);
  g.moveTo(s, s2);

  g.lineTo(s, s);
  g.moveTo(s, s);
  g.stroke();
  g.fill();
}