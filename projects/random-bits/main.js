'use strict';

const MAX_LENGTH = 1e3;

const FONT_SIZE = 32;
const OFFSET = 8;

const cols = {
  bg: '#ffffff',
  input: '#000000',
  output: '#a9a9a9',
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
  var modes = O.enum([
    'INPUT',
    'OUTPUT',
  ]);

  var mode = modes.INPUT;
  var str = '';

  O.ael('keydown', evt => {
    var code = evt.code;

    switch(code){
      case 'Backspace':
        if(mode === modes.OUTPUT) str = '';
        else str = str.substring(0, str.length - 1);
        mode = modes.INPUT;
        updateStr();
        break;

      case 'Delete':
        str = str.substring(1);
        updateStr();
        break;

      case 'Enter':
        if(mode === modes.INPUT){
          mode = modes.OUTPUT;
          str = randBits();
          updateStr();
        }
        break;

      default:
        var digit = code.match(/^(?:Digit|Numpad)(\d)$/);

        if(digit !== null){
          if(mode == modes.OUTPUT){
            mode = modes.INPUT;
            str = '';
          }

          digit = digit[1] | 0;
          str += digit;

          updateStr();
          break;
        }

        break;
    }
  });

  function updateStr(){
    clearCanvas();

    var col = mode === modes.INPUT ? cols.input : cols.output;
    drawStr(str, col);
  }

  function randBits(){
    if(str.length === 0) return '';

    var len = BigInt(str);
    if(len === 0n) return '';

    if(len > MAX_LENGTH) len = MAX_LENGTH;
    len = Number(len);

    return O.ca(len, () => {
      return O.rand(2);
    }).join('');
  }
}

function drawStr(str, col=null){
  if(col !== null)g.fillStyle = col;
  g.fillText(str, OFFSET, OFFSET);
}

function clearCanvas(){
  g.clearCanvas(cols.bg);
}