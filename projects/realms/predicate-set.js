'use strict';

class PredicateSet{
  constructor(func){
    this.func = func;
  }

  has(tile){
    return this.func(tile);
  }
}

module.exports = PredicateSet;