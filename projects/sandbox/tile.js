'use strict';

const Layer = require('./layer');
const Object = require('./object');

const {layersNum} = Object;

class Tile{
  constructor(grid, x, y){
    this.grid = grid;
    this.x = x;
    this.y = y;

    this.layers = O.ca(layersNum, i => new Layer(this, i));
  }

  draw(layer, g){
    for(const obj of this.layers[layer])
      obj.draw(g);
  }

  findMaxLayer(func){
    const {layers} = this;

    for(const i = this.maxLayer; i !== -1; i--)
      if(func(layers[i])) return i;

    return -1;
  }

  get maxLayer(){ return this.findMaxLayer(layer => layer.len !== 0); }
  get maxOpaqueLayer(){ return this.findMaxLayer(layer => layer.opaque); }
  get maxTransparentLayer(){ return this.findMaxLayer(layer => layer.transparent); }
  get maxFreeLayer(){ return this.findMaxLayer(layer => layer.free); }
  get maxOccupiedLayer(){ return this.findMaxLayer(layer => layer.occupied); }

  addObj(obj){ this.layers[obj.layer].addObj(obj); }
};

module.exports = Tile;