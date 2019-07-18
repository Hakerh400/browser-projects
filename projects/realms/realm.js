'use strict';

class Realm{
  get name(){ O.virtual('name'); }
  get ctors(){ O.virtual('ctors'); }
  createGen(start, pset){ O.virtual('createGenerator'); }
}

module.exports = Realm;