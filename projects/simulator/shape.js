'use strict';

const Model = require('./model');
const Vector = require('./vector');

const {zero} = Vector;

const shapes = new Map();

class Shape{
  constructor(obj, model, mat, scale=1, trans=zero(), rot=zero()){
    this.obj = obj;
    this.index = -1;

    this.model = model;
    this.mat = mat;
    this.scale = scale * .999;
    this.trans = trans;
    this.rot = rot;

    if(!shapes.has(model)) shapes.set(model, new Set());
    shapes.get(model).add(this);
  }

  remove(){
    const {model} = this;
    const ser = shapes.get(model);

    if(set.size === 1) shapes.delete(model);
    else set.delete(this);
  }
};

Shape.shapes = shapes;

module.exports = Shape;