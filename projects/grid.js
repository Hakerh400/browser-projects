'use strict';

var size = 40;
var diameter = .7;

var w = 1920 / size | 0;
var h = 1080 / size | 0;
var radius = diameter / 2;

var tileParams = ['dir', 'circ', 'wall'];

var cols = {
  bg: '#ffffff',
  nonMarkedLines: '#e0e0e0',
  markedLines: '#000000',
  darkCirc: '#000000',
  lightCirc: '#ffffff',
  wall: '#808080',
};

var drawFuncs = [
  drawGridLines,
  drawTile,
  drawFrameLines,
];

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
  var clientX = grid.iw >> 1;
  var clientY = grid.ih >> 1;

  window.addEventListener('keydown', evt => {
    switch(evt.code){
      case 'Enter': applyAlgorithms(); break;
      case 'KeyB': toggleCirc(1); break;
      case 'KeyW': toggleCirc(2); break;
      case 'KeyX': toggleWall(); break;
      case 'KeyR': resetGrid(); break;
      case 'KeyS': solve(); break;
      case 'KeyG': generate(); break;
      case 'ArrowUp': move(0); break;
      case 'ArrowLeft': move(1); break;
      case 'ArrowDown': move(2); break;
      case 'ArrowRight': move(3); break;
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

  window.addEventListener('mousemove', evt => {
    clientX = evt.clientX;
    clientY = evt.clientY;
  });

  window.addEventListener('contextmenu', evt => {
    evt.preventDefault();
  });

  function markLine(evt){
    var coords = getCoords(evt);
    if(coords === null) return;

    var [x, y, dir] = coords;
    sdir(x, y, dir);

    drawGrid();
  }

  function unmarkLine(evt){
    var coords = getCoords(evt);
    if(coords === null) return;

    var [x, y, dir] = coords;
    cdir(x, y, dir);
    
    drawGrid();
  }

  function toggleCirc(type){
    var coords = getCoords();
    if(coords === null) return;

    var [x, y] = coords;
    var d = grid.get(x, y);

    if(d.wall) cwall(x, y);
    
    if(d.circ == type) d.circ = 0;
    else d.circ = type;

    drawGrid();
  }

  function toggleWall(){
    var coords = getCoords();
    if(coords === null) return;

    var [x, y] = coords;
    var d = grid.get(x, y);

    if(d.wall) cwall(x, y);
    else swall(x, y);

    drawGrid();
  }

  function getCoords(evt = null){
    if(evt !== null){
      clientX = evt.clientX;
      clientY = evt.clientY;
    }

    var cx = (clientX - grid.iwh) / grid.s + grid.wh;
    var cy = (clientY - grid.ihh) / grid.s + grid.hh;

    var x = Math.floor(cx);
    var y = Math.floor(cy);

    var d = grid.get(x, y);
    if(d === null) return null;

    cx %= 1;
    cy %= 1;

    var a1 = cx <= cy;
    var a2 = 1 - cx < cy;
    var dir = (a2 << 1) | (a1 ^ a2);

    return [x, y, dir];
  }

  function move(dir){
    var collected = 0;

    grid.iterate((x, y, d) => d.moved = 0);

    grid.iterate((x, y, d) => {
      if(d.moved != 2 && d.circ == 1 && !gdir(x, y, dir)){
        var d1 = ndir(x, y, dir).d;
        if(d1 === null) return;

        if(!d.moved){
          d.circ = 0;
        }

        if(d1.circ != 1){
          if(d.circ == 2) collected++;
          d1.circ = 1;
          d1.moved = 2;
        }else{
          d1.moved = 1;
        }
      }
    });

    drawGrid();

    return collected;
  }

  function solve(){
    var dirPrev = -1;
    var p = [];

    grid.iterate((x, y, d) => {
      d.solvingDir1 = d.dir ^ 15;
      d.solvingDir2 = d.solvingDir1;

      if(d.circ == 1){
        p.push(new O.Point(x, y));
      }
    });

    if(p.length != 1) return;

    var {x, y} = p[0];
    var [xPrev, yPrev] = [x, y];
    var d = grid.get(x, y);

    window.requestAnimationFrame(performMove);

    function performMove(){
      var dir = -1;

      xPrev = x;
      yPrev = y;

      O.repeat(4, ddir => {
        if(dir == -1 && ddir != dirPrev && (d.solvingDir1 & (1 << ddir))){
          dir = ddir;
        }
      });

      if(dir == -1){
        O.repeat(4, ddir => {
          if(dir == -1 && ddir != dirPrev && (d.solvingDir2 & (1 << ddir))){
            dir = ddir;
          }
        });
      }

      if(dir == -1) return;

      if(d.solvingDir1 & (1 << dir)) d.solvingDir1 &= ~(1 << dir);
      else d.solvingDir2 &= ~(1 << dir);

      dirPrev = dir + 2 & 3;
      d.circ = 0;

      var obj = ndir(x, y, dir);

      x = obj.x;
      y = obj.y;
      d = obj.d;

      if(d.circ) dirPrev = -1;
      d.circ = 1;

      if(d.solvingDir1 & (1 << dirPrev)) d.solvingDir1 &= ~(1 << dirPrev);
      else d.solvingDir2 &= ~(1 << dirPrev);

      drawAdjacentTiles(0);
      drawAdjacentTiles(1);

      window.requestAnimationFrame(performMove);
    }

    function drawAdjacentTiles(mode){
      var px = mode ? x : xPrev;
      var py = mode ? y : yPrev;

      drawFuncs.forEach(func => {
        func(px, py, d, grid.g);
        
        grid.adjacent(px, py, (x, y, d, dir) => {
          if(!(d === null || d.wall)){
            func(x, y, d, grid.g);
          }
        });
      });
    }
  }

  function generate(){
    do{
      resetGrid();

      grid.iterate((x, y, d) => {
        d.visited = 0;
        if(Math.random() < .1) swall(x, y);
      });

      var x = O.rand(w);
      var y = O.rand(h);
      var dir = -1;

      var queue = [[x, y, -1]];
      var d = grid.get(x, y);

      if(d.wall) cwall(x, y);
      d.circ = 1;

      while(queue.length){
        [x, y, dir] = queue.splice(O.rand(queue.length), 1)[0];

        d = grid.get(x, y);
        if(d.visited) continue;

        O.repeat(4, dir => {
          if(!gdir(x, y, dir)){
            var obj = ndir(x, y, dir);

            if(obj.d !== null){
              queue.push([obj.x, obj.y, dir + 2 & 3]);
            }
          }
        });

        sdirs(x, y);
        if(dir != -1) cdir(x, y, dir);

        d.visited = 1;
        d.dirs = 15 & ~(1 << dir);
      }

      grid.iterate((x, y, d) => {
        if(!d.visited && !d.wall){
          swall(x, y);
        }
      });

      var freeSpace = 0;

      grid.iterate((x, y, d) => {
        if(!d.wall) freeSpace++;
      });
    }while(freeSpace < 100);

    findInternalCells();
    placeWhiteCircs();

    drawGrid();
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

  drawFuncs.forEach(func => {
    grid.setDrawFunc(func);
    grid.draw();
  });
}

function drawGridLines(x, y, d, g){
  g.strokeStyle = cols.nonMarkedLines;
  g.beginPath();
  g.rect(x, y, 1, 1);
  g.stroke();
}

function drawTile(x, y, d, g){
  g.strokeStyle = 'black';

  if(d.internal){
    g.fillStyle = '#e0e0ff';
    g.fillRect(x, y, 1, 1);
  }

  if(d.wall){
    g.fillStyle = cols.wall;
    g.fillRect(x, y, 1, 1);
    grid.drawFrame(x, y, drawWallFrame);
    return;
  }

  if(d.circ){
    g.fillStyle = [cols.darkCirc, cols.lightCirc][d.circ - 1];
    g.beginPath();
    g.arc(x + .5, y + .5, radius, 0, O.pi2);
    g.fill();
    g.stroke();
  }
}

function drawFrameLines(x, y, d, g){
  g.strokeStyle = cols.markedLines;

  grid.drawFrame(x, y, (d1, dir) => {
    if(d.wall && d1 && d1.wall) return false;
    if(!gdir(x, y, dir)) return false;
    return true;
  });
}

function drawWallFrame(d, dir){
  if(d === null) return true;
  return !d.wall;
}

function gdir(x, y, dir){
  var d = grid.get(x, y);

  if(d === null){
    var obj = ndir(x, y, dir);
    if((d = obj.d) === null) return 1;

    x = obj.x;
    y = obj.y;

    dir = dir + 2 & 3;
  }

  if(d.wall || (d.dir & (1 << dir))) return 1;
  if((d = ndir(x, y, dir).d) && d.wall) return 1;
  return 0;
}

function sdir(x, y, dir){
  var d = grid.get(x, y);
  if(d !== null) d.dir |= 1 << dir;
  if((d = ndir(x, y, dir).d) !== null) d.dir |= 1 << (dir + 2 & 3);
}

function sdirs(x, y){
  O.repeat(4, dir => sdir(x, y, dir));
}

function cdirs(x, y){
  O.repeat(4, dir => cdir(x, y, dir));
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

function swall(x, y){
  var d = grid.get(x, y);
  if(d === null || d.wall) return;

  if(d.circ) d.circ = 0;
  d.wall = 1;
  sdirs(x, y);
}

function cwall(x, y){
  var d = grid.get(x, y);
  if(d === null || !d.wall) return;

  d.wall = 0;
  sdirs(x, y);
}

/*
  Algorithms
*/

function applyAlgorithms(){
  findInternalCells();
  placeWhiteCircs();

  drawGrid();
}

function findInternalCells(){
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

function placeWhiteCircs(){
  grid.iterate((x, y, d) => {
    if(!(d.circ == 1 || d.wall)){
      if(d.internal && dirsNum(x, y) == 3) d.circ = 2;
      else d.circ = 0;
    }
  });
}

function dirsNum(x, y){
  return gdir(x, y, 0) + gdir(x, y, 1) + gdir(x, y, 2) + gdir(x, y, 3);
}