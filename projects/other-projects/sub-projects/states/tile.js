'use strict';

const {cols} = O.storage;

class Tile{
  constructor(state, num){
    this.state = state;
    this.num = num;
  }

  draw(g, x, y){
    g.fillStyle = this.state.col;
    g.fillRect(x, y, 1, 1);

    g.fillStyle = cols.text;
    g.fillText(this.num, x + .5, y + .5);
  }
};

module.exports = Tile;