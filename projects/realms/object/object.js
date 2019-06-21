'use strict';

const Pivot = require('../pivot');
const Transition = require('../transition');

const {
  Translation,
  Rotation,
} = Transition;

class Object{
  static traits = O.obj();
  static layer = 0;

  is = this.constructor.traits;
  layer = this.constructor.layer;

  transitions = [];

  constructor(tile){
    this.tile = tile;

    tile.addObj(this);
  }

  static initTraits(arr=[]){
    arr.push(this.name);
    return window.Object.assign(O.arr2obj(arr), this.traits);
  }

  draw(g, t, k){ O.virtual('draw'); }

  findPath(maxLen, func){
    const {tile} = this;

    const result = func(null, tile, []);

    if(result === 1) return [];
    if(result === -1 || maxLen === 0) return null;

    const visited = new Set([tile]);
    const queue = [[tile, []]];

    while(queue.length !== 0){
      const [tile, path] = queue.shift();
      const {adjsNum} = tile;

      for(let i = 0; i !== adjsNum; i++){
        const newTile = tile.adj(i);
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

  remove(){
    this.tile.removeObj(this);
  }
}

class Entity extends Object{
  static traits = this.initTraits(['occupying', 'entity']);
  static layer = 5;

  constructor(tile){
    super(tile);

    this.tickBound = this.tick.bind(this);
    this.tile.grid.test.on('tick', this.tickBound);
  }

  tick(){
    const {tile, transitions} = this;

    this.transitions.length = 0;

    while(1){
      const path = this.findPath(100, (prev, tile, path) => {
        if(path.length !== 0 && tile.has.occupying) return -1;
        if(tile.has.pickup) return 1;
        return 0;
      });

      if(path === null) return;

      if(path.length === 0){
        tile.get('Pickup').collect();
        continue;
      }

      const newTile = tile.adj(path[0]);

      tile.removeObj(this);
      newTile.addObj(this);
      this.tile = newTile;

      transitions.push(new Transition.Translation(tile, newTile));

      break;
    }
  }

  draw(g, t, k){
    g.fillStyle = 'white';
    g.beginPath();
    g.arc(0, 0, .45, 0, O.pi2);
    g.stroke();
    g.fill();
  }

  remove(){
    super.remove();
    this.tile.grid.test.rel('tick', this.tickBound);
  }
}

class Pickup extends Object{
  static traits = this.initTraits(['pickup']);
  static layer = 5;

  draw(g, t, k){
    g.fillStyle = 'yellow';
    g.beginPath();
    g.rect(-.25, -.25, .5, .5);
    g.stroke();
    g.fill();
  }

  collect(){
    const {tile} = this;

    while(1){
      const newTile = tile.grid.get(O.rand(-10, 10), O.rand(-10, 10));
      if(newTile.nempty) continue;

      tile.removeObj(this);
      newTile.addObj(this);
      this.tile = newTile;

      break;
    }
  }
}

class Wall extends Object{
  static traits = this.initTraits(['occupying', 'wall']);
  static layer = 4;

  draw(g, t, k){
    g.fillStyle = '#840';
    g.beginPath();
    g.rect(-.5, -.5, 1, 1);
    g.stroke();
    g.fill();
  }
}

Object.Entity = Entity;
Object.Pickup = Pickup;
Object.Wall = Wall;

module.exports = Object;