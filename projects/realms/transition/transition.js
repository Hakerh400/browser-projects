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