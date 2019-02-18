'use strict';

const cols = {
  0: new O.Color(252, 41, 41),
  1: new O.Color(214, 0, 39),
};

const defaultCol = cols[1];

window.setTimeout(main);

function main(){
  askForColor();
  aels();
}

function aels(){
  O.ael('keydown', evt => {
    if(evt.code === 'F5' || evt.code === 'Enter'){
      evt.preventDefault();
      askForColor();
    }
  });
}

function askForColor(){
  const s = O.body.style;
  s.backgroundColor = prompt('', '', defaultCol, 0);
  s.cursor = 'none';
}

function prompt(msg, text, defaultVal, allowEmpty=1){
  let val = window.prompt(msg, text);

  if(val === null || (!allowEmpty && val === ''))
    val = defaultVal;
  
  return val;
}