'use strict';

window.setTimeout(main);

function main(){
  createWorld();
}

function createWorld(){
  var world = World.create();
  var {w, h, g} = world;
  var [wh, hh] = [w, h].map(a => a / 2);

  var col = new Color(255, 0, 0);
  var ent = new Entity(world, wh, hh, col);

  ent.setCol(new Color(0, 255, 0));

  var n = 30;
  O.repeat(n, i => {
    var k = (i / n) ** .5;
    var angle = -(k * O.pi2);
    var len = i & 1 ? 150 : 100;
    var x = Math.cos(angle) * len;
    var y = Math.sin(angle) * len;

    ent.addVert(new O.Vector(x, y));
  });

  ent.reposition();

  var f = () => {
    world.render();

    var s = 64;
    var sh = s / 2;

    for(var y = sh; y < h; y += s){
      for(var x = sh; x < w; x += s){
        g.beginPath();
        g.fillStyle = ent.includes(new O.Vector(x, y)) ? '#ff0000' : '#00ffff';
        g.arc(x, y, 5, 0, O.pi2);
        g.fill();
      }
    }

    ent.moment = .01;

    O.raf(f);
  };

  f();
}

class GraphicalObject extends O.Vector{
  constructor(x, y, g){
    super(x, y);

    this.g = g;
  }

  setG(g){
    this.g = g;
  }

  getG(){
    return this.g;
  }

  render(){
    this.beginDraw();
    this.draw();
    this.finishDraw();
  }

  beginDraw(){
    var {x, y, g} = this;

    g.save();
    g.translate(x, y);
  }

  finishDraw(g){
    var {g} = this;

    g.restore();
  }
};

class Polygon extends GraphicalObject{
  constructor(x, y, g){
    super(x, y, g);

    this.verts = [];
    this.area = 0;
    this.centroid = new O.Vector(0, 0);
    this.updated = false;
  }

  addVert(v){
    this.updated = false;
    this.verts.push(v);
  }

  addVertAt(v, index){
    this.updated = false;
    this.verts.splice(index, 0, v);
  }

  getVert(index){
    if(index < 0 || index >= this.verts.length) return null;
    return this.verts[index];
  }

  removeVert(v){
    this.updated = false;
    var index = this.verts.indexOf(v);
    return this.removeVertAt(index);
  }

  removeVertAt(index){
    this.updated = false;
    return this.verts.splice(index, 1)[0];
  }

  clear(){
    this.updated = false;
    this.verts.length = 0;
  }

  getArea(){
    if(!this.updated) this.update();
    return this.area;
  }

  getCentroid(){
    if(!this.updated) this.update();
    return this.centroid;
  }

  updateOrigin(){
    this.update();

    var {verts} = this;
    var len = verts.length;

    var c = this.getCentroid();
    var d = c.clone().sub(this);

    for(var i = 0; i !== len; i++)
      verts[i].sub(d);

    this.add(d);
  }

  reposition(){
    this.translate(super.clone().mul(2).sub(this.getCentroid()));
    this.updateOrigin();
  }

  update(){
    var {verts} = this;
    var len = verts.length;

    if(len === 0){
      this.area = 0;
      this.centroid.set(0, 0);
      return;
    }

    var area = 0;
    var cx = 0;
    var cy = 0;

    var v1 = null;
    var v2 = verts[verts.length - 1];

    for(var i = 0; i !== len; i++){
      v1 = v2;
      v2 = verts[i];

      var d = v1.x * v2.y - v2.x * v1.y;

      area += d;
      cx += (v1.x + v2.x) * d;
      cy += (v1.y + v2.y) * d;
    }

    this.area = area / 2;
    this.centroid.set(cx, cy).mul(1 / 3 / area).add(this);

    this.updated = true;
  }

  *getEdges(){
    var {verts} = this;
    var len = verts.length;

    var e = [null, verts[verts.length - 1]];

    for(var i = 0; i !== len; i++){
      e[0] = e[1];
      e[1] = verts[i];

      yield e;
    }
  }

  translate(v){
    var dx = this.x = v.x;
    var dy = this.y = v.y;
    this.set(v);

    var c = this.getCentroid();
    c.x += dx;
    c.y += dy;
  }

  rotate(angle){
    if(!this.updated) this.update();

    var {verts} = this;
    var len = verts.length;

    for(var i = 0; i !== len; i++)
      verts[i].rotate(angle);

    this.updated = false;
  }

  rotateAround(v, angle){
    if(!this.updated) this.update();

    var {verts} = this;
    var len = verts.length;

    v = v.clone().sub(this);

    for(var i = 0; i !== len; i++)
      verts[i].sub(v).rotate(angle).add(v);

    this.updated = false;
  }

  includes(v){
    var {verts} = this;
    var len = verts.length;

    var c = false;
    var x = v.x - this.x;
    var y = v.y - this.y;

    for(var i = 0, j = len - 1; i !== len; j = i++){
      var vi = verts[i];
      var vj = verts[j];

      if((vi.y > y) !== (vj.y > y) && x < (vj.x - vi.x) * (y - vi.y) / (vj.y - vi.y) + vi.x)
        c = !c;
    }

    return c;
  }
};

class Color extends Uint8Array{
  constructor(r, g, b){
    super(3);

    this.set(r, g, b);
  }

  static from(rgb){
    return new Color(...rgb);
  }

  set(r, g, b){
    this[0] = r;
    this[1] = g;
    this[2] = b;
    this.updateStr();
  }

  setR(r){
    this[0] = r;
    this.updateStr();
  }

  setG(g){
    this[1] = g;
    this.updateStr();
  }

  setB(b){
    this[2] = b;
    this.updateStr();
  }

  updateStr(){
    this.str = `#${[...this].map(byte => {
      return byte.toString(16).padStart(2, '0');
    }).join('')}`;
  }

  toString(){
    return this.str;
  }
};

class Entity extends Polygon{
  constructor(world, x, y, col){
    super(x, y, world.g);

    this.world = world;
    this.world.addEnt(this);
    this.setCol(col);

    this.vel = new O.Vector(0, 0);
    this.moment = 0;
  }

  setCol(col){
    this.col = col;
  }

  getCol(){
    return this.col;
  }

  tick(){
    this.add(this.vel);
    this.rotate(this.moment);
  }

  draw(){
    var {g, col, verts} = this;
    var len = verts.length;

    g.fillStyle = col;
    g.beginPath();

    for(var i = 0; i !== len; i++){
      var v = verts[i];
      g.lineTo(v.x, v.y);
    }

    g.closePath();
    g.fill();
    g.stroke();

    var c = this.getCentroid().clone().sub(this);
    g.fillStyle = 'black';
    g.beginPath();
    g.arc(c.x, c.y, 5, 0, O.pi2);
    g.fill();

    g.beginPath();
    g.arc(0, 0, 10, 0, O.pi2);
    g.stroke();
  }
};

class World{
  constructor(w, h, g){
    this.w = w;
    this.h = h;
    this.g = g;

    this.ents = [];
  }

  static create(){
    var {w, h, g} = O.ceCanvas();
    var world = new World(w, h, g);

    return world;
  }

  addEnt(ent){
    this.ents.push(ent);
  }

  removeEnt(ent){
    var index = this.ents.findIndex(ent);
    return this.removeEntAt(index);
  }

  removeEntAt(index){
    return this.ents.splice(index, 1)[0];
  }

  render(){
    var {w, h, g} = this;

    g.fillStyle = 'white';
    g.fillRect(0, 0, w, h);

    this.ents.forEach(ent => {
      ent.tick();
      ent.render();
    });
  }
};

window.i = 0;