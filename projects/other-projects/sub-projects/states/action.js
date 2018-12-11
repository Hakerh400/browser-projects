'use strict';

class Action{
  constructor(state, x, y, dir=-1, num=0){
    this.state = state;
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.num = num;
  }
};

module.exports = Action;