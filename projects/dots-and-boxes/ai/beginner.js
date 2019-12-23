'use strict';

const AI = require('./ai');

class AIBeginner extends AI{
  play(){
    const {grid, player, depth} = this;

    const lines = grid.getAvailLines();

    for(const [x, y, type] of lines)
      if(grid.wouldCloseSquares(x, y, type))
        return grid.setLine(x, y, type);

    const [x, y, type] = O.randElem(lines);
    return grid.setLine(x, y, type);
  }
}

module.exports = AIBeginner;