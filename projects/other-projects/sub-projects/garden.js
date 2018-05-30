'use strict';

window.setTimeout(main);

function main(){
  var world = World.create();
  var {w, h, g} = world;
  var [wh, hh] = [w, h].map(a => a / 2);

  var col = new Color(255, 0, 0);
  var ent = new Entity(world, wh, hh, col);

  ent.setCol(new Color(0, 255, 0));

  ent.addVert(0, 0);
  ent.addVert(100, 0);
  ent.addVert(100, 100);
  ent.addVert(200, 100);
  ent.addVert(200, 0);
  ent.addVert(300, 0);
  ent.addVert(300, 200);
  ent.addVert(0, 200);

  ent.updateOrigin();
  ent.translate(wh, hh);

  var f = () => {
    ent.updateOrigin();
    ent.rotate(.02);

    ent.update();
    world.render();

    var s = 30;
    var sh = s / 2;

    for(var y = sh; y < h; y += s){
      for(var x = sh; x < w; x += s){
        g.beginPath();
        g.fillStyle = ent.includes(x, y) ? '#ff0000' : '#00ffff';
        g.arc(x, y, 5, 0, O.pi2);
        g.fill();
      }
    }

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

  addVert(x, y){
    this.updated = false;
    var vert = new O.Vector(x, y);
    this.verts.push(vert);
    return vert;
  }

  addVertAt(x, y, index){
    this.updated = false;
    var vert = new O.Vector(x, y);
    this.verts.splice(index, 0, vert);
    return vert;
  }

  getVert(index){
    if(index < 0 || index >= this.verts.length) return null;
    return this.verts[index];
  }

  removeVert(x, y){
    this.updated = false;
    var index = this.verts.findIndex(vert => vert.x === x && vert.y === y);
    return this.removeVertByIndex(index);
  }

  removeVertByIndex(index){
    this.updated = false;
    return this.verts.splice(index, 1)[0];
  }

  clear(){
    this.updated = false;
    this.verts.length = 0;
  }

  getArea(){
    if(!this.updated)
      this.update();

    return this.area;
  }

  getCentroid(){
    if(!this.updated)
      this.update();

    return this.centroid;
  }

  updateOrigin(){
    var {verts} = this;
    var len = verts.length;

    var c = this.getCentroid();
    var cx = c.x;
    var cy = c.y;

    for(var i = 0; i !== len; i++){
      var v = verts[i];
      v.x -= cx;
      v.y -= cy;
    }

    this.x += cx;
    this.y += cy;

    c.x = 0;
    c.y = 0;
  }

  update(){
    var {verts} = this;
    var len = verts.length;

    if(len === 0){
      this.area = 0;
      this.centroid.x = 0;
      this.centroid.y = 0;
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

    area /= 2;

    var k = 1 / 6 / area;
    cx *= k;
    cy *= k;

    this.area = area;
    this.centroid.x = cx;
    this.centroid.y = cy;

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

  translate(x, y){
    var dx = x - this.x;
    var dy = y - this.y;

    this.x += dx;
    this.y += dy;
    this.centroid.x += dx;
    this.centroid.y += dy;
  }

  rotate(angle){
    var {verts} = this;
    var len = verts.length;

    for(var i = 0; i !== len; i++)
      verts[i].rotate(angle);

    this.updated = false;
  }

  includes(x, y){
    var {verts} = this;
    var len = verts.length;

    var c = false;
    x -= this.x;
    y -= this.y;

    for(var i = 0, j = len - 1; i !== len; j = i++){
      var vi = verts[i];
      var vj = verts[j];

      if(((vi.y > y) !== (vj.y > y)) && (x < (vj.x - vi.x) * (y - vi.y) / (vj.y - vi.y) + vi.x))
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
    this.setCol(col);

    this.world.addEnt(this);
  }

  setCol(col){
    this.col = col;
  }

  getCol(){
    return this.col;
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

    g.fillStyle = 'black';
    g.beginPath();
    g.arc(this.getCentroid().x, this.getCentroid().y, 5, 0, O.pi2);
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
    return this.removeEntByIndex(index);
  }

  removeEntByIndex(index){
    return this.ents.splice(index, 1)[0];
  }

  render(){
    var {w, h, g} = this;

    g.fillStyle = 'white';
    g.fillRect(0, 0, w, h);

    this.ents.forEach(ent => {
      ent.render();
    });
  }
};

window.i = 0;