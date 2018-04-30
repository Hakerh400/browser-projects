'use strict';

const ARROW_SIZE = .8;

var size = 40;

var w = 1920 / size | 0;
var h = 1080 / size | 0;

var tileParams = [
  'circ',
  'dir',
  'arrow',
  'tube',
  'wall',
  'fire',
];

var cols = {
  arrowBg: '#c0c0c0',
  arrow: '#000000',
  tubeBg: '#008000',
  tube: '#00ff00',
  wall: '#808080',
  fire: '#ffff00',
};

var grid = null;
var g = null;

window.setTimeout(main);

function main(){
  grid = new O.TilesGrid();
  grid.setTileParams(tileParams);
  grid.setWH(w, h);
  grid.setSize(size);
  grid.setDrawFunc(drawFunc);

  g = grid.g;
  g.lineCap = 'round';
  g.lineJoin = 'round';

  createGrid();
  drawGrid();

  aels();
}

function aels(){
  ael('mousedown', evt => {
    var x = Math.floor((evt.clientX - g.tx) / g.s);
    var y = Math.floor((evt.clientY - g.ty) / g.s);
    var d = grid.get(x, y);
    if(d === null) return;

    if(evt.button === 0){
      applyAlgorithms(x, y);
      drawGrid();
    }
  });

  ael('contextmenu', evt => {
    evt.preventDefault();
  });

  ael('_msg', evt => {
    switch(evt.type){
      case 'sample':
        evt.data = sample();
        break;

      default:
        throw new TypeError('Unrecognized event type');
        break;
    }
  });

  function ael(type, func){
    window.addEventListener(type, evt => {
      func(evt);
    });
  }
}

function createGrid(){
  grid.create((x, y) => {
    return O.ca(tileParams.length, () => 0);
  });

  resetGrid();
}

function resetGrid(){
  grid.iterate((x, y, d) => {
    generateTile(x, y);
  });
}

function drawGrid(){
  grid.draw();
}

function drawFunc(x, y, d, g){
  var s1 = 1 - ARROW_SIZE;
  var s2 = ARROW_SIZE;

  if(d.circ){
    g.fillStyle = cols.arrowBg;
    g.fillRect(x, y, 1, 1);

    g.fillStyle = cols.arrow;
    g.beginPath();
    g.arc(x + .5, y + .5, 5 / size, 0, O.pi2);
    g.fill();
    g.stroke();
  }else if(d.arrow){
    g.fillStyle = cols.arrowBg;
    g.fillRect(x, y, 1, 1);

    g.lineWidth = 3;
    g.strokeStyle = cols.arrow;
    g.beginPath();

    if((d.dir & 1) === 0){
      g.moveTo(x + .5, y + s1);
      g.lineTo(x + .5, y + s2);
      g.moveTo(x + .25, y + .5);
      g.lineTo(x + .5, d.dir & 2 ? y + s2 : y + s1);
      g.lineTo(x + .75, y + .5);
    }else{
      g.moveTo(x + s1, y + .5);
      g.lineTo(x + s2, y + .5);
      g.moveTo(x + .5, y + .25);
      g.lineTo(d.dir & 2 ? x + s2 : x + s1, y + .5);
      g.lineTo(x + .5, y + .75);
    }

    g.stroke();
    g.strokeStyle = '#000000';
    g.lineWidth = 1;
  }else if(d.tube){
    g.fillStyle = cols.tubeBg;
    g.fillRect(x, y, 1, 1);
    g.fillStyle = cols.tube;
    grid.drawTube(x, y, d.dir, .25, 1);
  }else if(d.wall){
    g.fillStyle = cols.wall;
    g.fillRect(x, y, 1, 1);
  }else if(d.fire){
    g.fillStyle = cols.fire;
    g.fillRect(x, y, 1, 1);
  }

  grid.drawFrame(x, y);
}

function generateTile(x, y){
  if(O.rand(5) === 1) setCirc(x, y);
  else setArrow(x, y, O.rand(4));
}

function sample(){
  var coords = [];

  grid.iterate((x, y, d) => {
    if(d.arrow)
      coords.push([x, y]);
  });

  if(coords.length === 0)
    return null;

  return O.randElem(coords);
}

function applyAlgorithms(xx, yy){
  var d = grid.get(xx, yy);
  if(d === null || !d.arrow)
    return;

  var id = getId();
  var fire = false;

  var coords = [[xx, yy]];
  d.tubeDir = 0;

  O.repeat(2, mode => {
    var x = xx;
    var y = yy;
    var d = grid.get(x, y);
    var dirPrev = null;
    var first = true;

    while(1){
      if(!first){
        if(d.id !== id){
          coords.push([x, y]);
          d.tubeDir = d.tube ? d.dir : 0;
        }else if(d.arrow){
          fire = true;
          if(d.mode === mode)
            break;
        }
      }

      d.id = id;
      d.mode = mode;

      var dir = mode === 0 ? d.dir : d.dir + 2 & 3;
      if(dirPrev !== null) d.tubeDir |= 1 << (dirPrev + 2 & 3);
      if(d.arrow) d.tubeDir |= 1 << dir;
      dirPrev = dir;

      if(!d.arrow){
        if(d.fire)
          fire = true;
        break;
      }

      ({x, y, d} = ndir(x, y, dir));
      if(d === null)
        break;

      first = false;
    }
  });

  grid.iterate((x, y, d) => {
    if(d.fire)
      generateTile(x, y);
  });

  coords.forEach(([x, y]) => {
    var d = grid.get(x, y);

    if(!fire){
      if(d.arrow || d.circ || d.tube)
        setTube(x, y, d.tubeDir);
    }else{
      O.repeat(4, dir => {
        var d1 = ndir(x, y, dir).d;
        if(d1 !== null && d1.tube)
          d1.dir &= ~(1 << (dir + 2 & 3));
      });

      setFire(x, y);
    }
  });
}

function getId(){
  return Object.create(null);
}

function setCirc(x, y){
  var d = grid.get(x, y);
  if(d === null) return;
  d.arrow = d.tube = d.wall = d.fire = 0;
  d.circ = 1;
}

function setArrow(x, y, dir){
  var d = grid.get(x, y);
  if(d === null) return;
  d.circ = d.tube = d.wall = d.fire = 0;
  d.arrow = 1;
  d.dir = dir;
}

function setTube(x, y, dir){
  var d = grid.get(x, y);
  if(d === null) return;
  d.circ = d.arrow = d.wall = d.fire = 0;
  d.tube = 1;
  d.dir = dir;
}

function setWall(x, y){
  var d = grid.get(x, y);
  if(d === null) return;
  d.circ = d.arrow = d.tube = d.fire = 0;
  d.wall = 1;
}

function setFire(x, y){
  var d = grid.get(x, y);
  if(d === null) return;
  d.circ = d.arrow = d.tube = d.wall = 0;
  d.fire = 1;
}

function ndir(x, y, dir){
  if(dir === 0) y--;
  else if(dir === 1) x--;
  else if(dir === 2) y++;
  else x++;

  var d = grid.get(x, y);

  return {x, y, d};
}