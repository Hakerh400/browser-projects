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
  O.enhanceRNG();

  g.textBaseline = 'top';
  g.textAlign = 'left';

  g.fontFamily = 'Consolas';
  g.font(FONT_SIZE);

  clearCanvas();

  aels();
}

function aels(){
  var strs = O.ca(9, i => {
    return O.ca(MAX_LENGTH, () => {
      return O.rand(i + 2);
    }).join('');
  });

  updateStrs();

  O.ael('keydown', evt => {
    switch(evt.code){
      case 'ArrowRight':
        strs.forEach((str, i) => {
          strs[i] = `${str.substring(1)}${O.rand(i + 2)}`;
        });

        updateStrs();
        break;
    }
  });

  function updateStrs(){
    clearCanvas();

    strs.forEach((str, i) => {
      drawStr(`${i + 1} - ${str}`, i, cols.text);
    });
  }
}

function drawStr(str, i=0, col=null){
  if(col !== null) g.fillStyle = col;
  g.fillText(str, OFFSET, OFFSET + FONT_SIZE * i);
}

function clearCanvas(){
  g.clearCanvas(cols.bg);
}