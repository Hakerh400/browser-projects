'use strict';

var w = 30;
var h = 12;
var size = 40;

var tileParams = ['dir', 'circ', 'wall'];

var cols = {
  bg: '#ffffff',
  nonMarkedLines: '#e0e0e0',
  markedLines: '#000000',
  darkCirc: '#000000',
  lightCirc: '#ffffff',
  wall: '#808080',
};

var grid = null;

window.setTimeout(main);

function main(){
  grid = new O.TilesGrid();

  grid.setWH(w, h);
  grid.setSize(size);
  grid.setTileParams(tileParams);
  grid.setDrawFunc(drawFunc);

  clearGrid();
}

function drawFunc(x, y, d, g){
  if(d.wall){
    g.fillStyle = cols.wall;
    g.fillRect(x, y, 1, 1);
    grid.drawFrame(x, y);
    return;
  }

  g.fillStyle = [cols.bg, '#e0e0ff'][d.internal];
  g.fillRect(x, y, 1, 1);

  g.strokeStyle = cols.nonMarkedLines;
  g.beginPath();
  g.rect(x, y, 1, 1);
  g.stroke();
  g.strokeStyle = cols.markedLines;

  if(d.circ){
    g.fillStyle = [cols.darkCirc, cols.lightCirs][d.circ - 1];
    g.beginPath();
    g.arc(x + .5, y + .5, .4, 0, O.pi2);
    g.fill();
    g.stroke();
  }

  grid.drawFrame(x, y, (d1, dir) => {
    if(!gdir(x, y, dir)) return false;

    if(d.internal || (d1 && d1.internal)) g.strokeStyle = cols.markedLines;
    else g.strokeStyle = '#ff0000';

    return true;
  });
}

function clearGrid(){
  grid.create(() => {
    return [0, 0, 0];
  });

  grid.iterate((x, y, d) => {
    if(Math.random() > 1 / Math.sqrt(2)) sdir(x, y, 0);
    if(Math.random() > 1 / Math.sqrt(2)) sdir(x, y, 1);
    if(Math.random() > 1 / Math.sqrt(2)) sdir(x, y, 2);
    if(Math.random() > 1 / Math.sqrt(2)) sdir(x, y, 3);
  });

  calcInternalCells();

  drawGrid();
}

function calcInternalCells(){
  var arr = [];
  var queue = [];

  grid.iterate((x, y, d) => d.internal = 1);

  O.repeat(w, x => queue.push([x, -1], [x, h]));
  O.repeat(h, y => queue.push([-1, y], [w, y]));

  while(queue.length){
    var [x, y] = queue.shift();
    var d = grid.get(x, y);

    if(d !== null){
      if(!d.internal) continue;
      d.internal = 0;
    }

    O.repeat(4, dir => {
      if(!gdir(x, y, dir)){
        var obj = ndir(x, y, dir);
        queue.push([obj.x, obj.y]);
      }
    });
  }
}

function gdir(x, y, dir){
  var d = grid.get(x, y);
  if(d === null) d = ndir(x, y, dir).d, dir = dir + 2 & 3;
  if(d === null) return 1;
  return !!(d.dir & (1 << dir)) | 0;
}

function sdir(x, y, dir){
  var d = grid.get(x, y);
  if(d !== null) d.dir |= 1 << dir;
  if((d = ndir(x, y, dir).d) !== null) d.dir |= 1 << (dir + 2 & 3);
}

function cdir(x, y, dir){
  var d = grid.get(x, y);
  if(d !== null) d.dir &= ~(1 << dir);
  if((d = ndir(x, y, dir).d) !== null) d.dir &= ~(1 << (dir + 2 & 3));
}

function ndir(x, y, dir){
  x += (dir == 3) - (dir == 1) | 0;
  y += (dir == 2) - (dir == 0) | 0;

  return {
    x, y,
    d: grid.get(x, y),
  };
}

function drawGrid(){
  grid.draw();
}