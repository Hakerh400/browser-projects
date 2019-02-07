'use strict';

const types = require('./transition-types');

class Transition{
  constructor(type, interpolation, time){
    this.type = type;
    this.interpolation = interpolation;
    this.time = time;
  }

  async start(){
    //
  }
};

Transition.types = types;

module.exports = Transition;