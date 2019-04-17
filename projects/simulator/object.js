'use strict';

const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Vector = require('./vector');

const TICK_TIME = 1e3;

const {zero} = Vector;

const activeObjs = new Set();

class Object extends Vector{
  constructor(tile){
    const {x, y, z} = tile;
    super(x, y, z);

    this.grid = tile.grid;
    this.tile = tile;
    this.index = -1;

    this.rot = 0;
    this.elevation = 0;

    this.animStart = 0;
    this.animEnd = 0;
    this.animX = x;
    this.animY = y;
    this.animZ = z;
    this.animRot = 0;

    this.shapes = [];

    tile.addObj(this);
  }

  static start(){
    Object.tick();
    setInterval(Object.tick, TICK_TIME);
  }

  static tick(){
    for(const obj of activeObjs)
      obj.tick();
  }

  addShape(shape){
    const {shapes} = this;

    shape.index = shapes.length;
    shapes.push(shape);
  }

  removeShape(shape){
    const {shapes} = this;
    const {index} = shape;
    const last = shapes.pop();

    last.index = index;
    if(shapes.length !== 0) shapes[index] = last;
  }

  move(x, y, z, pushed=0, dir=null){
    const {grid} = this;
    if(!grid.has(x, y, z)) return;

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

  nav(dir, pushed=0){
    const {x, y, z} = this;
    if(dir === 0) this.move(x, y, z - 1, pushed, dir);
    else if(dir === 1) this.move(x + 1, y, z, pushed, dir);
    else if(dir === 2) this.move(x, y, z + 1, pushed, dir);
    else if(dir === 3) this.move(x - 1, y, z, pushed, dir);
    else if(dir === 4) this.move(x, y - 1, z, pushed, dir);
    else this.move(x, y + 1, z, pushed, dir);
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
    this.rot = rot;
    this.animStart = t;
    this.animEnd = t + TICK_TIME;
  }

  getX(t){ return this.intp(t, this.animX, this.x); }
  getY(t){ return this.intp(t, this.animY, this.y); }
  getZ(t){ return this.intp(t, this.animZ, this.z); }

  getRot(t){
    const {animStart, animEnd, animRot: a, rot: b} = this;
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
    for(const shape of this.shapes)
      shape.remove();
  }
};
Object.activeObjs = activeObjs;

class ActiveObject extends Object{
  constructor(tile){
    super(tile);

    activeObjs.add(this);
  }

  remove(){
    super.remove();
    activeObjs.remove(this);
  }

  tick(){ O.virtual('tick'); }
};

class Grass extends Object{
  constructor(tile){
    super(tile);

    this.addShape(new Shape(this, Model.cube, Material.grass));
  }
};

class Stone extends Object{
  constructor(tile){
    super(tile);

    this.addShape(new Shape(this, Model.cube, Material.stone));
  }
};

class Entity extends ActiveObject{
  constructor(tile){
    super(tile);

    this.addShape(new Shape(this, Model.sphere, Material.entity));
  }

  getX(t){ return super.getX(t) + .5; }
  //getY(t){ return super.getY(t) + .5; }
  getZ(t){ return super.getZ(t) + .5; }

  tick(){
    this.nav(O.rand(4));
    this.rotate(this.rot - O.pi / 10);
  }

  //getY(t){ return super.getY(t) + Math.sin(t / 1e3) * .2; }
};

Object.ActiveObject = ActiveObject;
Object.Grass = Grass;
Object.Stone = Stone;
Object.Entity = Entity;

module.exports = Object;