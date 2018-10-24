'use strict';

const Vector = require('./vector');

class Camera extends Vector{
  constructor(x, y, z, pitch, yaw, vx, vy, vz){
    super(x, y, z);

    this.pitch = pitch;
    this.yaw = yaw;

    this.vel = new Vector(vx, vy, vz);
  }

  tick(){
    this.add(this.vel.clone().rot_(this.pitch, this.yaw, 0));
  }
};

module.exports = Camera;