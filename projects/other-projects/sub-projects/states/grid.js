'use strict';

const State = require('./state');
const Tile = require('./tile');
const UpdatesList = require('./updates-list');

const {size, cols} = O.storage;
const size1 = 1 / size + 1;

class Grid{
  constructor(w, h){
    this.w = w;
    this.h = h;

    const pasiveState = new State(this, cols.bg, 0);
    this.pasiveState = pasiveState;

    this.d = O.ca(h, y => O.ca(w, x => {
      return new Tile(pasiveState, 0);
    }));

    this.states = new Set();
    this.pending = new Set();
    this.updates = new UpdatesList();
  }

  has(x, y){
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  get(x, y){
    if(!this.has(x, y)) return null;
    return this.d[y][x];
  }

  set(x, y, tile){
    if(!this.has(x, y)) return;
    this.d[y][x] = tile;
  }

  iter(func){
    const {w, h, d} = this;

    for(var y = 0; y !== h; y++)
      for(var x = 0; x !== w; x++)
        if(func(x, y, d[y][x]))
          break;
  }

  performAction(action){
    const {states, pending, updates} = this;

    var {state, x, y, dir, num} = action;
    var sameTile = dir === -1;

    var d = this.get(x, y);

    do{
      if(!pending.has(state)) break;

      if(sameTile){
        add(1);
        break;
      }

      add(-num);
      switch(dir){
        case 0: y--;
        case 1: x++;
        case 2: y++;
        case 3: x--;
      }
      add(num);
    }while(0);

    this.tick();
    this.draw();

    function add(num){
      updates.add(x, y, state, num);
    }
  }

  tick(){
    const {states, pending, updates} = this;
    if(pending.size !== 0) return;
  }

  draw(g){
    const {w, h, d} = this;

    for(var y = 0; y !== h; y++)
      for(var x = 0; x !== w; x++)
        d[y][x].draw(g, x, y);

    g.beginPath();
    g.rect(0, 0, w, h);
    for(var y = 0; y !== h; y++){
      for(var x = 0; x !== w; x++){
        var state = d[y][x].state;

        if(y !== 0 && d[y - 1][x].state !== state){
          g.moveTo(x, y);
          g.lineTo(x + size1, y);
        }

        if(x !== 0 && d[y][x - 1].state !== state){
          g.moveTo(x, y);
          g.lineTo(x, y + size1);
        }
      }
    }
    g.stroke();
  }
};

module.exports = Grid;