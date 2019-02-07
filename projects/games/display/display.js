'use strict';

const Transition = require('./transition');
const Interpolation = require('./interpolation');
const states = require('./display-states');

class Display{
  constructor(elem){
    this.elem = elem;
    this.state = states.empty;
    this.ts = null;
    this.ctxs = [];
    this.activeCtx = null;
  }

  addCtx(ctx){
    this.ctxs.push(ctx);
  }

  removeCtx(ctx){
    const {ctxs} = this;
    const i = ctxs.indexOf(ctx);
    if(i === -1) return;
    ctxs.splice(ctx, 1);
  }

  async displayCtx(ctx, ts){
    //
  }

  ael(elem, type, func){
    O.ael(elem, type, func);
  }

  rel(elem, type, func){
    O.rel(elem, type, func);
  }
};

Display.Transition = Transition;
Display.Interpolation = Interpolation;
Display.states = states;

module.exports = Display;