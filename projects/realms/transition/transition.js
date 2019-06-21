'use strict';

const intps = {
  linear: k => k,
};

class Transition{
  constructor(intp=intps.linear){
    this.intp = intp;
  }
}

module.exports = Transition;

const Translation = require('./translation');
const Rotation = require('./rotation');

Object.assign(Transition, {
  Translation,
  Rotation,
});