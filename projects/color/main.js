'use strict';

const defaultCol = new O.Color(252, 41, 41);

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
  s.backgroundColor = prompt('', '', defaultCol);
  s.cursor = 'none';
}

function prompt(msg, text, defaultVal){
  let val = window.prompt(msg, text);
  if(val === null) val = defaultVal;
  return val;
}