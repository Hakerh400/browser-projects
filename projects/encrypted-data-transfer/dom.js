'use strict';

const EventEmitter = require('./event-emitter');
const Event = require('./event');

class DOM extends EventEmitter{
  constructor(parent, remote){
    super();

    this.parent = parent;
    this.remote = remote;
  }

  reset(){
    for(var e of O.qsa(this.parent, '*'))
      e.remove();

    if(!this.remote){
      this.warn('[LOCAL]');
      this.br(2);
    }
  }

  form(){
    return new Form(this);
  }

  msg(text, col='black'){
    var label = this.ce('span');
    label.style.color = col;
    O.ceText(label, text);
    return label;
  }

  succ(text){ return this.msg(text, '#00a000'); }
  warn(text){ return this.msg(text, '#888800'); }
  err(text){ return this.msg(text, '#a00000'); }
  ce(tag){ return O.ce(this.parent, tag); }
  div(parent, style){ return O.ce(parent, 'div', style); }
  br(num){ return O.ceBr(this.parent, num); }
};

class Form extends EventEmitter{
  constructor(dom){
    super();

    this.dom = dom;
    this.parent = dom.parent;

    this.active = 1;
    this.inputs = O.obj();

    this.submitFunc = O.nop;
  }

  pause(){ this.active = 0; }
  resume(){ this.active = 1; }

  reset(){
    var {inputs} = this;

    for(var inputName in inputs)
      inputs[inputName].value = '';
  }

  input(name, label, focus=0){
    var elem = this.dom.div(this.parent, 'input');
    var labelElem = O.ce(elem, 'span');
    O.ceText(labelElem, `${label}: `);

    var input = O.ce(elem, 'input');
    input.type = 'text';
    if(focus) input.focus();

    O.ael(input, 'keydown', this.evt(0, evt => {
      if(evt.orig.code !== 'Enter') return;
      this.submitFunc();
    }));

    this.inputs[name] = input;
    return input;
  }

  btn(label=null, submit=0){
    if(label === null){
      label = 'Submit';
      submit = 1;
    }

    var btn = this.dom.ce('button');
    O.ceText(btn, label);

    var func;
    if(!submit){
      func = this.evt(1, evt => {
        evt.name = evt.orig.target.innerText.trim();
        this.emit('btn', evt);
      });
    }else{
      func = this.evt(1, evt => {
        this.emit('submit', evt);
      });
      this.submitFunc = func;
    }
    O.ael(btn, 'click', func);

    return btn;
  }

  get(input, getElem=0){
    var {inputs} = this;
    if(!(input in inputs)) return null;

    var elem = inputs[input];
    if(getElem) return elem;
    return elem.value;
  }

  focus(input, value=null){
    var elem = this.get(input, 1);
    elem.focus();
    if(value !== null) elem.value = value;
    return elem;
  }

  val(input, value){
    this.get(input, 1).value = value;
  }

  evt(pause, func){
    return orig => {
      if(!this.active) return;
      if(pause) this.pause();

      var evt = new Event(orig);
      func(evt);

      if(pause && !evt.defaultPrevented)
        this.resume();
    };
  }
};

DOM.Form = Form;

module.exports = DOM;