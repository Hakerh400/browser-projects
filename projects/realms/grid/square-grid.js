'use strict';

const Grid = require('./grid');
const Tile = require('../tile');

const ZOOM_FACTOR = .9;

const createObj = () => {
  const obj = O.obj();
  obj.size = 0;
  return obj;
};

const createKey = (obj, key) => {
  obj.size++;
  const obj1 = obj[key] = createObj();
  return obj1;
};

class SquareGrid extends Grid{
  #d = createObj();

  constructor(reng){
    super(reng);

    this.tx = 0;
    this.ty = 0;
    this.scale = 40;
  }

  draw(g, t){
    const {reng, tx, ty, scale} = this;
    const {left, top, width: w, height: h} = reng.brect;
    const wh = w / 2;
    const hh = h / 2;

    const xx = -tx * scale + wh;
    const yy = -ty * scale + hh;
    const scale1 = scale * 0.9875;

    g.fillStyle = 'black';
    g.fillRect(0, 0, w, h);
    g.lineWidth = 1 / 40;

    const xStart = Math.floor(tx - wh / scale);
    const yStart = Math.floor(ty - hh / scale);
    const xEnd = xStart + Math.ceil(w / scale) + 2;
    const yEnd = yStart + Math.ceil(h / scale) + 2;

    for(let y = yStart; y !== yEnd; y++){
      for(let x = xStart; x !== xEnd; x++){
        g.save();
        g.translate(xx + x * scale, yy + y * scale);
        g.scale(scale1, scale1);
        this.get(x, y).draw(g, t);
        g.restore();
      }
    }
  }

  zoom(dir){
    const {reng} = this;
    const {width: w, height: h} = reng.brect;
    const {cx, cy} = reng;
    const wh = w / 2;
    const hh = h / 2;

    const k = dir < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
    const sk = (k - 1) / (k * this.scale);

    this.tx += (cx - wh) * sk;
    this.ty += (cy - hh) * sk;
    this.scale *= k;
  }

  has(x, y){
    let d = this.#d;
    if(!(y in d)) return 0;
    d = d[y];
    return x in d;
  }

  gen(x, y){
    let d = this.#d;

    if(!(y in d)) d = createKey(d, y);
    else d = d[y];

    if(x in d) throw new TypeError(`Already has (${x}, ${y})`);

    d.size++;
    const tile = d[x] = new Tile.SquareTile(this, 2, x, y);
    let adj;

    if(adj = this.getRaw(x, y - 1)) tile.setAdj(0, adj), adj.setAdj(2, tile);
    if(adj = this.getRaw(x + 1, y)) tile.setAdj(1, adj), adj.setAdj(3, tile);
    if(adj = this.getRaw(x, y + 1)) tile.setAdj(2, adj), adj.setAdj(0, tile);
    if(adj = this.getRaw(x - 1, y)) tile.setAdj(3, adj), adj.setAdj(1, tile);

    return tile;
  }

  getRaw(x, y){
    let d = this.#d;
    if(!(y in d)) return null;
    d = d[y];
    if(!(x in d)) return null;
    return d[x];
  }

  get(x, y){
    let d = this.#d;
    if(!(y in d)) return this.gen(x, y);
    d = d[y];
    if(!(x in d)) return this.gen(x, y);
    return d[x];
  }
}

module.exports = SquareGrid;