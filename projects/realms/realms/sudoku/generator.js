'use strict';

const RealmGenerator = require('../../realm-generator');
const cs = require('./ctors');

const {DigitType} = cs.Ground;

class Generator extends RealmGenerator{
  constructor(realm, key, pset){
    super(realm, key, pset);
  }

  gen(tile){
    const {grid, first} = this;
    this.startGen();

    const set = this.allocRect(tile, 11, 11).tiles;

    const type = grid.rand(4);
    const digit = grid.rand(9) + 1;

    for(const tile of set){
      new cs.Ground(tile, type, digit);
    }

    this.endGen();
  }
}

module.exports = Generator;