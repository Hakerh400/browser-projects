'use strict';

const st = O.storage;
const size = st.size = 40;

const cols = st.cols = {
  bg: 'darkgray',
  text: 'black',
};

const Grid = require('./grid');
const State = require('./state');
const Tile = require('./tile');
const Action = require('./action');

const ws = 10;
const hs = 10;

const fontScale = .75;

const {w, h, g} = O.ceCanvas(1);

const [wh, hh] = [w, h].map(a => a / 2);
const [wsh, hsh] = [ws, hs].map(a => a / 2);
const [tx, ty] = [wh - wsh * size, hh - hsh * size];

const grid = new Grid(ws, hs);
const state = new State(grid, 'red');

window.setTimeout(main);

function main(){
  g.font(size * fontScale);
  drawGrid();

  aels();
}

function aels(){
  var clicked = 0;
  var x, y;

  O.ael('mousedown', evt => {
    if(evt.button !== 0) return;

    x = Math.floor((evt.clientX - tx) / size);
    y = Math.floor((evt.clientY - ty) / size);

    grid.set(x, y, new Tile(state, 5));
    drawGrid();
  });

  O.ael('mouseup', evt => {
    if(evt.button !== 0) return;


  });
}

function drawGrid(){
  g.resetTransform();
  g.clearCanvas(cols.bg);

  g.translate(tx, ty);
  g.scale(40);

  grid.draw(g);
}