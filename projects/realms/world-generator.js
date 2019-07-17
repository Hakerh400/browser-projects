'use strict';

const RealmGenerator = require('./realm-generator');
const PredicateSet = require('./predicate-set');
const realms = require('./realms');

class WorldGenerator{
  constructor(grid){
    this.grid = grid;
    this.gens = new Map();
    this.onGenBound = this.onGen.bind(this);

    this.init();
  }

  hasGen(realm, key){
    const {gens} = this;
    return gens.has(realm) && key in gens.get(realm);
  }

  createGen(realm, key){
    const {gens} = this;
    const gen = new RealmGenerator();
  }

  getGen(realm, key){
    const {gens} = this;
    if(this.hasGen(realm, key)) return gens.get(realm)[key];
    return this.createGen(realm, key);
  }

  getGenRaw(realm, key){
    const {gens} = this;
    if(this.hasGen(realm, key)) return gens.get(realm)[key];
    return null;
  }

  init(){
    const {grid} = this;

    const realm1 = new realms['sokoban'](grid);
    const realm2 = new realms['sudoku'](grid);

    const f = (x, y) => {
      return Math.sin(O.hypot(x, y) / 2) >= 0;
    };

    const pset1 = new PredicateSet(tile => {
      const {x, y} = tile;

      return f(x, y);
    });

    const pset2 = new PredicateSet(tile => {
      const {x, y} = tile;

      return !f(x, y);
    });

    const start = grid.get(0, 0);
    const gen1 = realm1.createGenerator(start, pset1);
    const gen2 = realm2.createGenerator(start, pset2);
    gen1.gen(start);

    grid.on('gen', this.onGenBound);
  }

  onGen(tile){

  }
}

module.exports = WorldGenerator;