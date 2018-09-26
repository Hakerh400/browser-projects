'use strict';

const EventEmitter = require('./event-emitter');

const {body} = O;

class Form extends EventEmitter{
  constructor(){
    super();

    this.active = 1;
    this.inputs = O.obj();
  }

  pause(){ this.active = 0; }
  resume(){ this.active = 1; }

  reset(){
    var {inputs} = this;

    for(var inputName in inputs)
      inputs[inputName].value = '';
  }

  input(name, label){
    var elem = div(body, 'input');
    var labelElem = O.ce(elem, 'span');
    O.ceText(labelElem, `${label}: `);

    var input = O.ce(elem, 'input');
    input.type = 'text';

    O.ael(input, 'keydown', evt => {
      if(evt.code !== 'Enter') return;
      this.submit();
    });

    this.inputs[name] = input;
    return input;
  }

  btn(label='Submit'){
    var btn = ce('button');
    O.ceText(btn, label);

    O.ael(btn, 'click', this.submit.bind(this));

    return btn;
  }

  get(input, getElem=0){
    var {inputs} = this;
    if(!(input in inputs)) return null;

    var elem = inputs[input];
    if(getElem) return elem;
    return elem.value;
  }

  submit(){
    if(!this.active) return;
    this.emit('submit');
  }
};

function reset(){
  for(var e of O.qsa(body, '*'))
    e.remove();
}

function form(){
  return new Form();
}

function succ(text){
  return msg(text, '#00a000');
}

function err(text){
  return msg(text, '#a00000');
}

function msg(text, col='black'){
  var label = ce('span');
  label.style.color = col;
  O.ceText(label, text);
  return label;
}

function ce(tag){
  return O.ce(body, tag);
}

function div(parent, style){
  return O.ce(parent, 'div', style);
}

function br(num){
  return O.ceBr(body, num);
}

module.exports = {
  Form,

  reset,
  form,

  succ,
  err,
  msg,

  ce,
  div,
  br,
};