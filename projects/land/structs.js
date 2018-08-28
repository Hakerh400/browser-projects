'use strict';

const TileContent = require('./tile-content');
const objs = require('./tile-objects');

class Structure{
  constructor(){}

  gen(structs, adj1, adj2){
    return null;
  }
};

class ExpandableStructure extends Structure{
  constructor(stab){
    super();

    this.stab = stab;
  }
};

class Biome extends ExpandableStructure{
  constructor(stab){
    super(stab);
  }
};

module.exports = {
  Structure,
  ExpandableStructure,
  Biome,
};