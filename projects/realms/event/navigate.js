'use strict';

const Event = require('./event');

class Navigate extends Event{
  constructor(dir, tile){
    super('navigate', tile);
    this.dir = dir;
  }
}

module.exports = Navigate;