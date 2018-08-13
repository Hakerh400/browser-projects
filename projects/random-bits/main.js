'use strict';

const MAX_LENGTH = 150;

const FONT_SIZE = 32;
const OFFSET = 8;

const cols = {
  bg: '#ffffff',
  text: '#000000',
};

const {w, h, g} = O.ceCanvas(1);

window.setTimeout(main);

function main(){
  g.textBaseline = 'top';
  g.textAlign = 'left';

  g.fontFamily = 'Consolas';
  g.font(FONT_SIZE);

  clearCanvas();

  aels();
}

function aels(){
  var str = O.ca(MAX_LENGTH, () => {
    return O.rand(2);
  }).join('');

  updateStr();

  O.ael('keydown', evt => {
    switch(evt.code){
      case 'ArrowRight':
        str = str.substring(1);
        str += O.rand(2);
        updateStr();
        break;
    }
  });

  function updateStr(){
    clearCanvas();
    drawStr(str, cols.text);
  }
}

function drawStr(str, col=null){
  if(col !== null)g.fillStyle = col;
  g.fillText(str, OFFSET, OFFSET);
}

function clearCanvas(){
  g.clearCanvas(cols.bg);
}