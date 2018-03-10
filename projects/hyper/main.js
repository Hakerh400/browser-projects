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

  var dd = Math.sin(Date.now() / 1e3);
  drawLine(dd, -3, dd, 3);

  //drawLine(0, 1e3, 1e3, 0);
  g.stroke();

  O.raf(render);
}

function drawLine(x1, y1, x2, y2){
  /*var px = x1;
  var py = y1;
  var qx = x2;
  var qy = y2;

  var pd = px * px + py * py;
  var qd = qx * qx + qy * qy;

  var px_ = px / pd;
  var py_ = py / pd;
  var qx_ = qx / qd;
  var qy_ = qy / qd;

  var mx = (px + px_) / 2;
  var my = (py + py_) / 2;
  var nx = (qx + qx_) / 2;
  var ny = (qy + qy_) / 2;

  var kpp_ = (py_ - py) / (px_ - px);
  var kqq_ = (qy_ - qy) / (qx_ - qx);

  var km = -1 / kpp_;
  var kn = -1 / kqq_;

  var cx = (my - ny + kn * nx - km * mx) / (kn - km);
  var cy = my + km * (cx - mx);

  var x = wh + cx * diskRadius;
  var y = hh + cy * diskRadius;

  var r = Math.hypot(cx - px, cy - py);

  //x = wh + x * diskRadius;
  //y = hh + y * diskRadius;
  r *= diskRadius;

  g.arc(x, y, r, 0, O.pi2);

  //console.log(x, y);

  return;*/

  /////////////////////////////////////////////////////////////////////////////////////

  var start = [x1, y1];
  var end = [x2, y2];
  var hc = [...start];

  var dx = x2 - x1;
  var dy = y2 - y1;

  var stepSize = .01;
  var stepsNum = Math.floor(Math.max(dx, dy) / stepSize);

  dx /= stepsNum;
  dy /= stepsNum;

  hcoords(hc);
  g.moveTo(hc[0], hc[1]);

  for(var i = 0; i < stepsNum; i++){
    hc[0] = start[0] += dx;
    hc[1] = start[1] += dy;

    hcoords(hc);
    g.lineTo(hc[0], hc[1]);
  }

  hcoords(end);
  g.lineTo(end[0], end[1]);
}

function hcoords(coords){
  var [x, y] = coords;

  var d = 1 / (1 / (x * x) + 1 / (y * y));

  if(isNaN(d)) throw 0;

  x *= d;
  y *= d;

  coords[0] = wh + x * diskRadius;
  coords[1] = hh + y * diskRadius;
}