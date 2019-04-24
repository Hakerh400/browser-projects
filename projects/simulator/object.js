'use strict';

const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Ray = require('./ray');
const Vector = require('./vector');

const TICK_TIME = 1e3;

const {zero} = Vector;

const activeObjs = new Set();

class Object extends Ray{
  constructor(tile){
    const {x, y, z} = tile;
    super(x, y, z);

    this.grid = tile.grid;
    this.tile = tile;
    this.index = -1;

    this.elevation = 0;

    this.animStart = 0;
    this.animEnd = 0;
    this.animX = x;
    this.animY = y;
    this.animZ = z;
    this.animRot = 0;

    this.shapes = [];
    this.dir = 0;

    this.is = this.constructor.is;

    tile.addObj(this);
  }

  static traits(arr){
    const obj = O.obj();
    for(const trait of arr) obj[trait] = 1;
    return obj;
  }

  static start(){
    Object.tick();
    setInterval(Object.tick, TICK_TIME);
  }

  static tick(){
    for(const obj of activeObjs)
      obj.tick();
    Object.lastTick = Date.now();
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

  move(x, y, z, pushed=0, dir=null){
    const {grid} = this;

    const d1 = this.tile;
    const d2 = grid.get(x, y, z);

    if(!d2.empty){
      if(pushed || dir === null || !d2.sngl) return;
      d2.fst.push(dir);
      if(!d2.empty) return;
    }

    d1.removeObj(this);
    this.tile = grid.get(x, y, z);
    this.tile.addObj(this);

    const t = Date.now();
    const proto = Object.prototype;
    this.animX = proto.getX.call(this, t);
    this.animY = proto.getY.call(this, t);
    this.animZ = proto.getZ.call(this, t);
    this.animRot = proto.getRot.call(this, t);
    this.x = x;
    this.y = y;
    this.z = z;
    this.animStart = t;
    this.animEnd = t + TICK_TIME;
  }

  movev(v){ return this.move(v.x, v.y, v.z); }

  nav(dir, pushed=0){
    this.movev(Vector.from(this).nav(dir), pushed, dir);
  }

  push(dir){
    this.nav(dir, 1);
  }

  rotate(rot){
    if(Math.abs(rot) > O.pi2) rot %= O.pi2;
    if(rot < 0) rot += O.pi2;

    const t = Date.now();
    const proto = Object.prototype;
    this.animX = proto.getX.call(this, t);
    this.animY = proto.getY.call(this, t);
    this.animZ = proto.getZ.call(this, t);
    this.animRot = proto.getRot.call(this, t);
    this.ry = rot;
    this.animStart = t;
    this.animEnd = t + TICK_TIME;
  }

  getX(t){ return this.intp(t, this.animX, this.x); }
  getY(t){ return this.intp(t, this.animY, this.y); }
  getZ(t){ return this.intp(t, this.animZ, this.z); }

  getRot(t){
    const {animStart, animEnd, animRot: a, ry: b} = this;
    if(t > animEnd) return b;

    const k = (t - animStart) / (animEnd - animStart);
    return a + ((((((b - a) % O.pi2) + O.pi3) % O.pi2) - O.pi) * k) % O.pi2;
  }

  intp(t, a, b){
    const {animStart, animEnd} = this;
    if(t > animEnd) return b;

    const k = (t - animStart) / (animEnd - animStart);
    return a * (1 - k) + b  * k;
  }

  remove(){
    this.tile.removeObj(this);

    for(const shape of this.shapes)
      shape.remove();
  }
};
Object.TICK_TIME = TICK_TIME;
Object.activeObjs = activeObjs;
Object.lastTick = Date.now();
Object.is = Object.traits([]);

class ActiveObject extends Object{
  constructor(tile){
    super(tile);

    activeObjs.add(this);
  }

  remove(){
    super.remove();
    activeObjs.delete(this);
  }

  tick(){ O.virtual('tick'); }
};

class Dirt extends Object{
  constructor(tile){
    super(tile);

    this.addShape(new Shape(Model.cube, Material.dirt));
  }
};
Dirt.is = Object.traits(['occupying', 'opaque', 'blocking', 'ground']);

class Stone extends Object{
  constructor(tile){
    super(tile);

    this.addShape(new Shape(Model.cube, Material.stone));
  }
};
Stone.is = Object.traits(['occupying', 'opaque', 'blocking', 'ground', 'pushable']);

class Man extends ActiveObject{
  constructor(tile){
    super(tile);

    this.s1 = new Shape(Model.test1, Material.man);
    this.s2 = new Shape(Model.test2, Material.man);

    this.i = 0;
    this.addShape(this.s1);
  }

  tick(){
    const {grid, dir} = this;
    const v = Vector.from(this);

    const {s1, s2} = this;
    if(this.i ^= 1) this.removeShape(s1), this.addShape(s2);
    else this.removeShape(s2), this.addShape(s1);

    if(O.rand(5) !== 0 && grid.getv(v.nav(dir)).empty && !grid.getv(v.nav(4)).empty){
      this.nav(dir);
    }else{
      this.dir = dir + (O.rand(2) ? 1 : -1) & 3;
      this.rotate(this.dir * -O.pih);
    }
  }
};
Man.is = Object.traits(['occupying']);

Object.ActiveObject = ActiveObject;
Object.Dirt = Dirt;
Object.Stone = Stone;
Object.Man = Man;

module.exports = Object;