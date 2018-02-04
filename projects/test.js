'use strict';

var w = 20;
var h = 10;
var s = 32;

var grid = new O.TilesGrid();

grid.setWH(w, h);
grid.setSize(s);
grid.setTileParams(['circ', 'col', 'num']);

grid.setDrawFunc((x, y, d, g) => {
  g.fillStyle = d.col ? 'red' : 'white';
  g.fillRect(x, y, 1, 1);

  if(d.circ){
    g.fillStyle = d.col ? 'white' : 'red';
    g.strokeStyle = 'black';
    g.beginPath();
    g.moveTo(x + .9, y + .5);
    g.arc(x + .5, y + .5, .4, 0, O.pi2);
    g.fill();
    g.stroke();
  }else{
    if(!d.col){
      g.fillStyle = 'black';
      g.fillText(d.num, x + .5, y + .5);
    }
  }

  grid.drawFrame(x, y, (d1, dir) => {
    if(d1 === null) return true;
    return d.col != d1.col;
  });
});

grid.create((x, y) => {
  return [O.rand(2), O.rand(2), O.rand(10)];
});

grid.draw();