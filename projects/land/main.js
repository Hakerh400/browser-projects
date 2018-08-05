'use strict';

const Display = require('./display');

const w = 1920;
const h = 1080;
const s = 40;

var display;

window.setTimeout(main);

function main(){
  display = new Display(w, h, s);

  render();
}

function render(){
  display.update();

  O.raf(render);
}