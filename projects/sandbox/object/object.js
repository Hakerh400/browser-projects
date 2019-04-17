'use strict';

const derivedObjects = require('./derived-objects');

const baseType = [];

class Object{
  constructor(tile, type){
    this.tile = tile;
    this.type = type;
    this.elevation = 0;

    tile.addObj(this);
  }

  static getClass(name){
    const supClass = Object[name];
  }

  static get type(){ return baseType; }

  tick(){}
  draw(g){}

  getPublicField(){ O.virtual('getPublicField'); }
  getPrivateField(){ O.virtual('getPrivateField'); }

  get legacyLayer(){ O.virtual('legacyLayer'); }
  get layer(){ return this.legacyLayer + this.elevation; }

  get transparent(){ O.virtual('transparent'); }
  get opaque(){ return !this.transparent; }

  get stackable(){ O.virtual('stackable'); }
  get blocking(){ return !this.stackable; }
};


module.exports = Object;

for(let i = 0; i !== derivedObjects.length; i++){
  const name = derivedObjects[i];
  const derived = require(`./${name}`);
  Object[derived.name] = derived;

  if(i === derivedObjects.length - 1)
    Object.layersNum = derived.prototype.legacyLayer + 1;
}