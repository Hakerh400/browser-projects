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

  createGrid();
  addEventListeners();
}

function addEventListeners(){
  window.addEventListener('keydown', evt => {
    switch(evt.code){
      case 'Enter':
        calcInternalCells();
        drawGrid();
        break;

      case 'KeyR':
        resetGrid();
        break;
    }
  });

  window.addEventListener('mousedown', evt => {
    switch(evt.button){
      case 0:
        markLine(evt);
        break;

      case 2:
        unmarkLine(evt);
        break;
    }
  });

  window.addEventListener('contextmenu', evt => {
    evt.preventDefault();
  });

  function markLine(evt){
    var [x, y, dir] = getCoords(evt);
    sdir(x, y, dir);
    drawGrid();
  }

  function unmarkLine(evt){
    var [x, y, dir] = getCoords(evt);
    cdir(x, y, dir);
    drawGrid();
  }

  function getCoords(evt){
    var cx = (evt.clientX - grid.iwh) / grid.s + grid.wh;
    var cy = (evt.clientY - grid.ihh) / grid.s + grid.hh;

    var x = cx | 0;
    var y = cy | 0;

    var d = grid.get(x, y);
    if(d === null) return null;

    cx %= 1;
    cy %= 1;

    var a1 = cx <= cy;
    var a2 = 1 - cx < cy;
    var dir = (a2 << 1) | (a1 ^ a2);

    return [x, y, dir];
  }
}

function createGrid(){
  grid.create(() => {
    return [0, 0, 0];
  });

  resetGrid();
}

function resetGrid(){
  grid.iterate((x, y, d) => {
    d.dir = 0;
    d.circ = 0;
    d.wall = 0;

    d.internal = 0;
  });

  drawGrid();
}

function clearGrid(){
  var g = grid.g;

  g.fillStyle = cols.bg;
  g.fillRect(0, 0, w, h);
}

function drawGrid(){
  clearGrid();

  grid.setDrawFunc(drawGridLines);
  grid.draw();

  grid.setDrawFunc(drawTiles);
  grid.draw();

  grid.setDrawFunc(drawLines);
  grid.draw();
}

function drawGridLines(x, y, d, g){
  g.strokeStyle = cols.nonMarkedLines;
  g.beginPath();
  g.rect(x, y, 1, 1);
  g.stroke();
}

function drawTiles(x, y, d, g){
  if(d.wall){
    g.fillStyle = cols.wall;
    g.fillRect(x, y, 1, 1);
    grid.drawFrame(x, y);
    return;
  }

  if(d.internal){
    g.fillStyle = '#e0e0ff';
    g.fillRect(x, y, 1, 1);
  }

  if(d.circ){
    g.fillStyle = [cols.darkCirc, cols.lightCirs][d.circ - 1];
    g.beginPath();
    g.arc(x + .5, y + .5, .4, 0, O.pi2);
    g.fill();
    g.stroke();
  }
}

function drawLines(x, y, d, g){
  drawFrame(x, y);
}

function drawFrame(x, y){
  grid.g.strokeStyle = cols.markedLines;

  grid.drawFrame(x, y, (d1, dir) => {
    if(!gdir(x, y, dir)) return false;
    return true;
  });
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