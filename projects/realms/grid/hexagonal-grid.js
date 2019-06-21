'use strict';

const LayerPool = require('../layer-pool');
const Grid = require('./grid');
const Tile = require('../tile');

const ZOOM_FACTOR = .9;
const DEFAULT_SCALE = 40;
const LINE_WIDTH = 1 / DEFAULT_SCALE;
const SPACING = 1.12;

const {floor, ceil, round} = Math;

class HexagonalGrid extends Grid{
  #d = createObj();

  constructor(reng){
    super(reng);

    const {brect} = reng;
    this.pool = new LayerPool(brect.width, brect.height, HexagonalGridLayer);

    this.tx = 0;
    this.ty = 0;
    this.scale = DEFAULT_SCALE;
  }

  get target(){
    const {reng, tx, ty, scale} = this;
    const {width: w, height: h} = reng.brect;
    const wh = w / 2;
    const hh = h / 2;

    if(!reng.curIn) return null;

    const y = round(ty + (reng.cy - hh) / scale);
    const x = round(tx + (reng.cx - wh) / scale - (y & 1 ? .5 : 0));

    return this.get(x, y);
  }

  tick(){
    this.emit('tick');
  }

  draw(g, t, k){
    const {reng, pool, tx, ty, scale} = this;
    const {width: w, height: h} = reng.brect;
    const wh = w / 2;
    const hh = h / 2;

    pool.resize(w, h);
    pool.prepare();

    const xx = -tx * scale + wh;
    const yy = -ty * scale + hh;

    g.fillStyle = 'black';
    g.fillRect(0, 0, w, h);

    const xStart = floor(tx - wh / scale);
    const yStart = floor(ty - hh / scale);
    const xEnd = xStart + ceil(w / scale) + 1;
    const yEnd = yStart + ceil(h / scale) + 1;

    const cs = [0, 0];
    let x = 0, y = 0;

    const getCoords = tile => {
      const {x, y} = tile;

      cs[0] = x + (y & 1 ? .5 : 0);
      cs[1] = y;

      return cs;
    };

    for(y = yStart; y <= yEnd; y++){
      for(x = xStart; x <= xEnd; x++){
        const tile = this.get(x, y);

        for(const obj of tile.objs){
          const {layer, transitions} = obj;
          const trLen = transitions.length;
          const g = pool.getCtx(layer);

          g.resetTransform();
          g.translate(xx, yy);
          g.scale(scale, scale);

          if(trLen === 0){
            g.translate(x + (y & 1 ? .5 : 0), y);
            g.scale(SPACING, SPACING);

            obj.draw(g, t, k);
          }else{
            for(let i = trLen - 1; i !== -1; i--)
              transitions[i].apply(g, k, getCoords);

            g.scale(SPACING, SPACING);
            
            obj.draw(g, t, k);
          }
        }
      }
    }

    pool.draw(g);
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

    const odd = y & 1;

    d.size++;
    const tile = d[x] = new Tile.HexagonalTile(this, odd ? 3 : 2, x, y);
    let adj;

    if(adj = this.getRaw(odd ? x + 1 : x, y - 1))  tile.setAdj(0, adj), adj.setAdj(3, tile);
    if(adj = this.getRaw(x + 1, y))                tile.setAdj(1, adj), adj.setAdj(4, tile);
    if(adj = this.getRaw(odd ? x + 1 : x, y + 1))  tile.setAdj(2, adj), adj.setAdj(5, tile);
    if(adj = this.getRaw(odd ? x : x - 1, y + 1))  tile.setAdj(3, adj), adj.setAdj(0, tile);
    if(adj = this.getRaw(x - 1, y))                tile.setAdj(4, adj), adj.setAdj(1, tile);
    if(adj = this.getRaw(odd ? x : x - 1, y - 1))  tile.setAdj(5, adj), adj.setAdj(2, tile);

    this.emit('gen', tile);

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

class HexagonalGridLayer extends LayerPool.Layer{
  init(){
    const {g} = this;

    g.lineWidth = LINE_WIDTH;
  }

  prepare(){
    const {w, h, g} = this;

    g.resetTransform();
    g.clearRect(0, 0, w, h);

    this.wasUsed = 1;
  }
}

module.exports = Object.assign(HexagonalGrid, {
  HexagonalGridLayer,
});

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