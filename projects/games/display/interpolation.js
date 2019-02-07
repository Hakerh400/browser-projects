'use strict';

const types = require('./interpolation-types');

class Interpolation{
  constructor(type){
    this.type = type;
  }

  calcValue(value){
    //
  }
};

Interpolation.type = types;

module.exports = Interpolation;