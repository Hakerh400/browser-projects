'use strict';

class AI{
  constructor(grid, player, depth){
    this.grid = grid;
    this.player = player;
    this.depth = depth;
  }

  static create(grid, player1, player2){
    return [player1, player2].map((p, i) => {
      if(p[0] === 0) return null;

      const ctor = AI.getCtors()[p[1]];

      return new ctor(grid, i, p[2]);
    });
  }

  static getCtors(){
    return [
      AI.AIBeginner,
      AI.AIAdvanced,
      AI.AIPro,
    ];
  }

  play(){ O.virtual('play'); }
}

module.exports = AI;