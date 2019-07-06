'use strict';

const path = require('path');
const realmsList = require('../realms-list');

const cwd = __dirname;
const realms = O.obj();

for(const realm of realmsList){
  const ctors = require(path.join(cwd, realm));

  for(const ctorName of O.keys(ctors))
    ctors[ctorName].realm = realm;

  realms[realm] = ctors;
}

module.exports = realms;