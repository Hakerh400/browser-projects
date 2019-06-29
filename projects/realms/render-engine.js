'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const GridEvent = require('./grid-event');

const TICK_DURATION = 300;

const {sign} = Math;

class RenderEngine{
  constructor(canvas, gridCtor){
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.grid = new gridCtor(this);

    this.cx = 0;
    this.cy = 0;
    this.curIn = 0;

    this.listeners = [];
    this.actions = [];

    this.disposed = 0;
    this.aels();

    this.time = O.now - TICK_DURATION;

    this.renderBound = this.render.bind(this);
    O.raf(this.renderBound);
  }

  aels(){
    const {canvas, grid, actions, listeners} = this;

    this.ael(window, 'mousemove', evt => {
      this.updateCursor(evt);
    });

    this.ael(window, 'mousedown', evt => {
      this.updateCursor(evt);

      const btn = evt.button;

      actions.push(new GridEvent(btn, grid.target));
    });

    this.ael(window, 'wheel', evt => {
      this.updateCursor(evt);
      if(!this.curIn) return;

      const dir = sign(evt.deltaY);
      this.grid.zoom(dir);
    });

    this.ael(window, 'resize', evt => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    this.ael(window, 'contextmenu', evt => {
      O.pd(evt);
    });
  }

  ael(...args){
    this.listeners.push(args);
    O.ael(...args);
  }

  rels(){
    for(const args of this.listeners)
      O.rel(...args);
  }

  updateCursor(evt){
    const {left, top, width: w, height: h} = this.brect;
    const {clientX: x, clientY: y} = evt;

    if(x >= left && y >= top && x < left + w && y < top + h){
      this.cx = x - left;
      this.cy = y - top;
      this.curIn = 1;
    }else{
      this.curIn = 0;
    }
  }

  get brect(){
    return this.canvas.getBoundingClientRect();
  }

  dispose(){
    this.disposed = 1;
    this.rels();
  }

  render(){
    if(this.disposed) return;

    const {canvas, g, grid, actions} = this;
    const t = O.now;
    const dt = t - this.time;
    const k = dt / TICK_DURATION % 1;

    if(dt >= TICK_DURATION){
      for(const action of actions){
        const {type, tile} = action;
        if(tile === null) continue;
        
        if(type === 0) new Object.Entity(tile.reset());
        else new Object.Wall(tile.reset());
      }
      actions.length = 0;

      grid.tick();

      this.time = t;
    }

    grid.draw(g, t, k);

    O.raf(this.renderBound);
  }
}

module.exports = RenderEngine;