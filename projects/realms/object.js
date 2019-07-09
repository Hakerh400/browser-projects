'use strict';

const Message = require('./message');
const Transition = require('./transition');
const Pivot = require('./pivot');

const {
  Translation,
  Rotation,

  intps,
} = Transition;

class Object{
  static realm = null;
  static objName = null;
  static layer = 0;
  static traits = O.obj();

  static listenersG = O.obj();
  static listenersL = O.obj();
  static listenersM = O.obj();

  static gradients = [];
  static gradientInstances = [];

  layer = this.constructor.layer;
  is = this.constructor.traits;
  listensG = this.constructor.listenersG;
  listensL = this.constructor.listenersL;
  listensM = this.constructor.listenersM;

  transitions = [];

  constructor(tile){
    const {grid} = tile;
    
    this.grid = grid;
    this.tile = tile;

    tile.addObj(this);

    for(const type in this.listensG)
      grid.addGridEventListener(type, this);
  }

  static initTraits(arr){ return window.Object.assign(O.arr2obj(arr), this.traits); }
  static initListenersG(arr){ return window.Object.assign(O.arr2obj(arr), this.listensG); }
  static initListenersL(arr){ return window.Object.assign(O.arr2obj(arr), this.listensL); }
  static initListenersM(arr){ return window.Object.assign(O.arr2obj(arr), this.listensM); }

  static initGradients(arr){
    this.gradients = arr;
    this.gradientInstances = O.ca(arr.length, () => null);

    return arr;
  }

  ser(s){}
  deser(s){}

  gradient(g, index){
    const ctor = this.constructor;
    const instances = ctor.gradientInstances;
    const instance = instances[index];
    if(instance !== null) return instance;

    const params = ctor.gradients[index];
    const coords = params.slice(0, 4);
    const stops = params.slice(4);
    const len = stops.length;
    const len1 = len - 1;

    const grad = g.createLinearGradient.apply(g, coords);

    for(let i = 0; i !== len; i++)
      grad.addColorStop(i / len1, stops[i]);

    return ctor.gradientInstances[index] = grad;
  }
  
  draw(g, t, k){ O.virtual('draw'); }

  canMove(dir){
    const {tile} = this;
    const newTile = tile.adj(dir);
    const {has} = newTile;

    return has.ground && !has.occupying;
  }

  tryToMove(dir){
    if(!this.canMove(dir)) return 0;
    this.move(dir);
    return 1;
  }

  move(dir){
    const {tile} = this;
    const newTile = tile.adj(dir);

    this.moveToTile(newTile);
    this.addTr(new Translation(tile, newTile));
  }

  moveToTile(tile){
    this.tile.removeObj(this);
    tile.addObj(this);
    this.tile = tile;
  }

  send(obj, type, data){
    const msg = new Message(this, obj, type, data);

    if(obj !== null && type in obj.listensM)
      if(obj[type](msg))
        msg.consume();

    return msg;
  }

  addTr(transition){
    const {transitions} = this;

    transitions.push(transition);

    if(transitions.length === 1)
      this.grid.transitionsArr.push(transitions);
  }

  findPath(maxLen, func){
    const {tile} = this;
    const {rand} = this.grid;

    const result = func(null, tile, []);

    if(result === 1) return [];
    if(result === -1 || maxLen === 0) return null;

    const visited = new Set([tile]);
    const queue = [[tile, []]];

    while(queue.length !== 0){
      const [tile, path] = queue.shift();
      const {adjsNum} = tile;

      const start = rand(adjsNum);
      let first = 1;

      for(let i = start;; ++i === adjsNum && (i = 0)){
        if(i === start){
          if(first) first = 0;
          else break;
        }

        const newTile = tile.adj(i);
        if(newTile === null) debugger;
        if(visited.has(newTile)) continue;

        const newPath = path.concat(i);
        const result = func(tile, newTile, newPath);

        if(result === 1) return newPath;
        if(result === -1 || newPath.length === maxLen) continue;

        visited.add(newTile);
        queue.push([newTile, newPath]);
      }
    }

    return null;
  }

  update(){
    this.tile.update();
  }

  remove(){
    const {grid, tile} = this;

    tile.removeObj(this);

    for(const type in this.listensG)
      grid.removeGridEventListener(type, this);
  }
}

module.exports = Object;