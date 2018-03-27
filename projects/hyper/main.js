'use strict';

var {w, h, g} = O.ceCanvas();
var [wh, hh] = [w, h].map(a => a / 2);

var diskRadiusFactor = .9;
var diskRadius = Math.min(w, h) * diskRadiusFactor / 2;

var scaleFactor = .01;

var cols = {
  bg: '#000000',
  disk: '#ffffff',
};

window.setTimeout(main);

function main(){
  render();
}

function render(){
  g.fillStyle = cols.bg;
  g.fillRect(0, 0, w, h);

  g.fillStyle = cols.disk;
  g.beginPath();
  g.arc(wh, hh, diskRadius, 0, O.pi2);
  g.fill();

  g.lineWidth = 2;
  g.strokeStyle = 'red';
  g.beginPath();
  drawLine(0, -Date.now() / 1e3);
  g.stroke();

  O.raf(render);
}

function drawLine(r0, t0){
  var r = r0;
  var t = t0;

  var xy = [0, 0];

  for(var i = 0; i < 2; i++){
    hcoords(r, t, xy);
    g.lineTo(...xy);

    r += 1;
  }
}

function hcoords(r, t, xy){
  var x = Math.sinh(r) * Math.cos(t);
  var y = Math.cosh(r) * Math.sin(-t);
  var z = Math.sqrt(x * x + y * y + 1);

  x /= (z + 1);
  y /= (z + 1);

  xy[0] = wh + x * diskRadius;
  xy[1] = hh + y * diskRadius;
}