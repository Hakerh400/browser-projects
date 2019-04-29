'use strict';

const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Ray = require('./ray');
const Vector = require('./vector');

const {zero} = Vector;

const objs = new Set();

class Object extends Ray{
  static objs = objs;

  static is = Object.traits([]);
  is = this.constructor.is;

  #dir = 0;

  updateSym = Symbol();

  constructor(tile){
    const {x, y, z} = tile;
    super(x, y, z, 0, 0, 0);

    this.grid = tile.grid;
    this.tile = tile;
    this.index = -1;
    this.dir = 0;

    this.prev = Ray.from(this);
    this.shapes = [];

    this.aels();

    objs.add(this);
    tile.addObj(this);
  }

  static traits(arr){
    const obj = O.obj();
    for(const trait of arr) obj[trait] = 1;
    return obj;
  }

  aels(){
    const {grid} = this;

    this.tickBound = 'onTick' in this ? this.onTick.bind(this) : null;

    this.updateBound = 'onUpdate' in this ? type => {
      if(this.updateSym === grid.updateSym) return;
      this.updateSym = grid.updateSym;
      this.onUpdate(type);
    } : null;

    if(this.tickBound !== null) this.grid.ael('tick', this.tickBound);
  }

  rels(){
    if(this.tickBound !== null) this.grid.rel('tick', this.tickBound);
  }

  get(x, y, z){
    let t;

    switch(this.#dir){
      case 0: [x, z] = [x, z]; break;
      case 1: [x, z] = [z, x]; break;
      case 2: [x, z] = [-x, -z]; break;
      case 3: [x, z] = [-z, -x]; break;
    }

    return this.grid.get(this.x + x, this.y + y, this.z + z);
  }

  move(x, y, z){
    super.move(x, y, z);

    this.tile.removeObj(this);
    this.tile = this.grid.get(x, y, z);
    this.tile.addObj(this);
  }

  nav(dir){
    this.movev(Vector.navv(this, dir));
  }

  rot(rx, ry, rz){
    super.rot(rx, ry, rz);
  }

  get dir(){
    return this.#dir;
  }

  set dir(dir){
    this.#dir = dir;
    this.rot(0, (dir + 2) * O.pih, 0);
  }

  addShape(shape){
    const {shapes} = this;

    shape.obj = this;
    shape.index = shapes.length;
    shapes.push(shape);
  }

  removeShape(shape){
    const {shapes} = this;
    const {index} = shape;
    const last = shapes.pop();

    shape.obj = null;
    last.index = index;
    if(last !== shape) shapes[index] = last;
  }

  remove(){
    this.rels();
    this.tile.removeObj(this);
    objs.delete(this);

    for(const shape of this.shapes)
      shape.remove();
  }

  getv(v){ return this.get(v.x, v.y, v.z); }
  movev(v){ return this.move(v.x, v.y, v.z); }
  rotv(v){ return this.rot(v.x, v.y, v.z); }
};

class Dirt extends Object{
  static is = Object.traits(['occupying', 'opaque', 'blocking', 'ground']);

  constructor(tile){
    super(tile);

    this.addShape(new Shape(Model.cube, Material.dirt));
  }
};

class Stone extends Object{
  static is = Object.traits(['occupying', 'opaque', 'blocking', 'ground', 'pushable']);

  constructor(tile){
    super(tile);

    this.addShape(new Shape(Model.cube, Material.stone));
  }

  onUpdate(){
    const {grid} = this;

    if(grid.getv(Vector.navv(this, 4)).empty){
      this.nav(4);
      return;
    }
  }
};

class Man extends Object{
  static is = Object.traits(['occupying']);
  static num = 0;

  constructor(tile){
    super(tile);

    this.addShape(new Shape(Model.test1, Material.man));

    Man.num++;
  }

  onTick(){
    const {grid, dir} = this;

    if(grid.getv(Vector.navv(this, 4)).empty){
      this.nav(4);
      return;
    }

    if(Man.num !== 1 && O.rand(50) === 0){
      this.remove();
      return;
    }

    if(grid.getv(Vector.navv(this, dir)).empty && !grid.getv(Vector.navv(this, dir).nav(4)).empty){
      new Dirt(this.get(0, -1, -1).purge());
      if(O.rand(50) === 0) new Man(this.get(0, 0, -1).purge());
      this.nav(dir);
    }else{
      this.dir = dir + (O.rand(2) ? 1 : -1) & 3;
    }
  }

  remove(){
    super.remove();
    Man.num--;
  }
};

Object.Dirt = Dirt;
Object.Stone = Stone;
Object.Man = Man;

module.exports = Object;