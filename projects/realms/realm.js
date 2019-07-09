'use strict';

class Realm{
  constructor(grid){
    this.grid = grid;
  }

  get name(){ O.virtual('name'); }
  get ctors(){ O.virtual('ctors'); }

  createGenerator(start, pset){ O.virtual('createGenerator'); }
}

module.exports = Realm;