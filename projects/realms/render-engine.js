'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const Event = require('./event');

const TICK_DURATION = 100;

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
    this.events = [];

    this.disposed = 0;
    this.aels();

    this.time = 0;
    this.animating = 0;

    this.renderBound = this.render.bind(this);
    O.raf(this.renderBound);
  }

  aels(){
    const {canvas, grid, events, listeners} = this;

    this.ael(window, 'keydown', evt => {
      switch(evt.code){
        case 'ArrowUp':
          events.push(new Event.Navigate(0, grid.target));
          break;

        case 'ArrowRight':
          events.push(new Event.Navigate(1, grid.target));
          break;

        case 'ArrowDown':
          events.push(new Event.Navigate(2, grid.target));
          break;

        case 'ArrowLeft':
          events.push(new Event.Navigate(3, grid.target));
          break;
      }
    });

    this.ael(window, 'mousemove', evt => {
      this.updateCursor(evt);
    });

    this.ael(window, 'mousedown', evt => {
      this.updateCursor(evt);

      const btn = evt.button;

      // events.push(new Event(btn, grid.target));
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

    const {canvas, g, grid, events} = this;
    const t = O.now;
    let k = 0;

    main: {
      if(this.animating){
        const dt = t - this.time;
        k = dt / TICK_DURATION % 1;

        if(dt >= TICK_DURATION){
          this.animating = 0;
          grid.endAnimation();
          break main;
        }

        break main;
      }else{
        if(events.length === 0) break main;

        const evt = events.shift();
        if(!grid.emitAndTick(evt)) break main;
        
        this.time = t;
        this.animating = 1;
      }
    }

    grid.draw(g, t, k);

    O.raf(this.renderBound);
  }
}

module.exports = RenderEngine;