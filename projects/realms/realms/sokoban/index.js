'use strict';

const path = require('path');

const realm = 'sokoban';

const objNames = [
  // 'ground',
  // 'target',
  // 'box',
  // 'player',
  // 'wall',
];

const cwd = __dirname;
const objs = O.obj();

for(const objName of objNames){
  const obj = require(path.join(cwd, objName));
  obj.realm = realm;
  objs[obj.name] = obj;
}

module.exports = objs;