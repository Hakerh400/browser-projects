'use strict';

const Tile = require('./tile');

class Grid extends O.Grid{
  currentPlayer = 0;

  constructor(w, h){
    super(w + 1, h + 1, () => {
      return new Tile(null, 0);
    });

    this.availsNum = w * h * 2 + w + h;
  }

  setLine(x, y, type){
    const tile = this.get(x, y);

    tile.dirs |= 1 << type;
    this.availsNum--;

    return this.checkClosedSquares(x, y, type);
  }

  removeLine(x, y, type){
    const tile = this.get(x, y);

    tile.dirs &= ~(1 << type);
    this.availsNum++;

    const tile1 = type === 0 ?
      y !== 0 ? this.get(x, y - 1) : null :
      x !== 0 ? this.get(x - 1, y) : null;

    let n = 0;

    if(tile.player !== null){
      tile.player = null;
      n++;
    }

    if(tile1 !== null && tile1.player !== null){
      tile1.player = null;
      n++;
    }

    return n;
  }

  wouldCloseSquares(x, y, type){
    const n = this.setLine(x, y, type);
    this.removeLine(x, y, type);
    return n;
  }

  checkClosedSquares(x, y, type){
    const a = this.checkClosedSquare(x, y);
    const b = type === 0 ?
      y !== 0 && this.checkClosedSquare(x, y - 1) :
      x !== 0 && this.checkClosedSquare(x - 1, y);

    return a + b;
  }

  checkClosedSquare(x, y){
    const a = this.get(x, y);
    const b = this.get(x + 1, y);
    const c = this.get(x, y + 1);

    if(a.dirs === 3 && (b.dirs & 2) && (c.dirs & 1)){
      a.player = this.currentPlayer;
      return 1;
    }

    return 0;
  }

  getAvailLines(){
    const {w, h} = this;
    const lines = [];

    this.iter((x, y, {dirs}) => {
      if((dirs & 1) === 0 && x !== w - 1) lines.push([x, y, 0]);
      if((dirs & 2) === 0 && y !== h - 1) lines.push([x, y, 1]);
    });

    return lines;
  }
}

module.exports = Grid;