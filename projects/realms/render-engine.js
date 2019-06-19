'use strict';

class RenderEngine{
  constructor(canvas, gridCtor){
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.grid = new gridCtor(this);

    this.renderBound = this.render.bind(this);
    O.raf(this.renderBound);
  }

  render(){
    const {canvas, g, grid} = this;
    const t = O.now;

    grid.draw(g, t);

    O.raf(this.renderBound);
  }
}

module.exports = RenderEngine;