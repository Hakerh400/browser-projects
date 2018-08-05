'use strict';

const World = require('./world');

const cols = {
  bg: 'black',
};

class Display{
  constructor(w, h, s){
    this.w = w;
    this.h = h;
    this.s = s;

    this.world = new World(this);

    this.g = Display.createContext(w, h, s);
    this.clear();
  }

  static createContext(w, h, s){
    var body = O.body;
    body.classList.add('has-canvas');
    body.style.backgroundColor = 'black';

    var canvas = O.ce(O.body, 'canvas');
    canvas.width = w;
    canvas.height = h;

    var style = canvas.style;
    style.position = 'absolute';
    style.top = '50%';
    style.left = '50%';
    style.transform = 'translate(-50%, -50%)';

    var g = canvas.getContext('2d');
    g = new O.EnhancedRenderingContext(g);

    return g;
  }

  update(){
    this.tick();
    this.draw();
  }

  tick(){
    this.world.tick();
  }

  draw(){
    this.clear();
    this.world.draw();
  }

  clear(){
    this.g.clearCanvas(cols.bg);
  }
};

module.exports = Display;