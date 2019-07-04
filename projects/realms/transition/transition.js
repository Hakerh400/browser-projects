'use strict';

const intps = {
  LINEAR: k => k,
  DISCRETE: k => 0,
};

class Transition{
  constructor(intp=intps.LINEAR){
    this.intp = intp;
  }
}

module.exports = Object.assign(Transition, {
  intps,
});