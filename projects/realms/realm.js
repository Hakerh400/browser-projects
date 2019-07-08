'use strict';

class Realm{
  constructor(reng){
    this.reng = reng;
  }

  get name(){ O.virtual('name'); }
  get ctors(){ O.virtual('ctors'); }
}

module.exports = Realm;