'use strict';

class Tile{
  constructor(wall, dirs=0, locked=0){
    this.wall = wall & 1;
    this.dirs = dirs & 15;
    this.locked = locked & 1;
  }

  toggleLock(){
    if(this.wall) return;
    this.locked ^= 1;
  }
};

module.exports = Tile;