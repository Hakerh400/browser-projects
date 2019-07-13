'use strict';

const RealmBase = require('../../realm');
const WorldGenerator = require('./world-generator');
const cs = require('./ctors');

const NAME = 'sudoku';

for(const ctorName in cs)
  cs[ctorName].realm = NAME;

class Realm extends RealmBase{
  get name(){ return NAME; }
  get ctors(){ return cs }

  createGenerator(start, pset){
    return new WorldGenerator(this, start, pset);
  }
}

module.exports = Realm;