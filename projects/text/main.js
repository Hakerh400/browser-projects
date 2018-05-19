'use strict';

const EXTRA_DATA = 1;

const HEADER = 'machine';
const FOOTER = 'machine 1 func array call 0 set';

setTimeout(main);

function main(){
  var ta = O.ce(O.body, 'textarea');
  ta.style.width = '100%';
  ta.style.height = '300px';
  ta.focus();

  O.ceBr(O.body, 2);
  var div = O.ce(O.body, 'div');
  div.style.whiteSpace = 'pre';
  div.style.userSelect = 'all';
  
  var text = O.ceText(div, '');

  ta.addEventListener('input', () => {
    var str = EXTRA_DATA ? `${HEADER}\n` : '';
    str += func(ta.value);
    if(EXTRA_DATA) str += `\n${FOOTER}`;
    text.nodeValue = str;
  });
}

function func(a){
  return O.sanl([...a]
    .map(a => {
      return [...`${a.charCodeAt(0)}`.padStart(3, '0')]
        .join(' ');
    })
    .join(' ')
    .split(' ')
    .map((a, b) => {
      return `${a}${-~b & 31 ? '' : '\n'}`;
    })
    .join(' ')
    .trim())
    .map(a => a.trim())
    .join('\n');
}