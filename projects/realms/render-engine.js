'use strict';

class RenderEngine{
  #listeners = [];

  constructor(canvas, gridCtor){
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.grid = new gridCtor(this);

    this.cx = 0;
    this.cy = 0;
    this.curIn = 0;

    this.disposed = 0;
    this.aels();

    this.renderBound = this.render.bind(this);
    O.raf(this.renderBound);
  }

  aels(){
    const {canvas} = this;

    this.ael(window, 'mousemove', evt => {
      this.updateCursor(evt);
    });

    this.ael(window, 'wheel', evt => {
      this.updateCursor(evt);
      if(!this.curIn) return;

      const dir = Math.sign(evt.deltaY);
      this.grid.zoom(dir);
    });
  }

  ael(...args){
    this.#listeners.push(args);
    O.ael(...args);
  }

  rels(){
    for(const args of this.#listeners)
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

    const {canvas, g, grid} = this;
    const t = O.now;

    grid.draw(g, t);

    O.raf(this.renderBound);
  }
}

module.exports = RenderEngine;