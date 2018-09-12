'use strict';

const SPEED = 1e3;
const OFFSET = 10;

const cols = {
  bg: '#ffffff',
  text: '#000000',
};

var {w, h, g} = O.ceCanvas(1);
var arr = O.ca(2, () => 1);

window.setTimeout(main);

function main(){
  g.textBaseline = 'top';
  g.textAlign = 'left';
  g.font(40);

  draw();
  aels();
}

function aels(){
  var clicked = 0;

  O.ael('keydown', evt => {
    if(clicked) return;
    if(evt.code !== 'Enter') return;

    clicked = 1;
    O.raf(render);
  });
}

function render(){
  draw();
  tick();

  O.raf(render);
}

function tick(){
  for(var i = 0; i !== SPEED; i++)
    arr[O.rand(2)]++;
}

function draw(){
  g.clearCanvas(cols.bg);

  g.fillStyle = cols.text;
  g.fillText(arr[0] / arr[1], OFFSET, OFFSET);
}