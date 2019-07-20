'use strict';

const RealmGenerator = require('../../realm-generator');
const cs = require('./ctors');

const {DigitType} = cs.Ground;

class Generator extends RealmGenerator{
  constructor(realm, wgen, key){
    super(realm, wgen, key);
  }

  gen(tile){
    const {grid, first} = this;
    this.startGen();

    const island = this.allocIsland(tile, 121).tiles;

    for(const center of island){
      const rect = this.allocRect(center, 11, 11).tiles;
      if(rect.size !== 121) continue;

      const table = new O.Grid(9, 9, (x, y) => [0, 0]);

      const checkTable = (xt, yt) => {
        const n = table.get(xt, yt)[1];
        const x1 = xt - xt % 3;
        const y1 = yt - yt % 3;
        const x2 = x1 + 3;
        const y2 = y1 + 3;

        const checkTile = (x, y) => {
          return !(x === xt && y === yt) && table.get(x, y)[1] === n;
        };

        for(let y = 0; y !== 9; y++)
          if(checkTile(xt, y)) return 0;

        for(let x = 0; x !== 9; x++)
          if(checkTile(x, yt)) return 0;

        for(let y = y1; y !== y2; y++)
          for(let x = x1; x !== x2; x++)
            if(checkTile(x, y)) return 0;

        return 1;
      };

      for(let i = 0; i !== 81;){
        const x = i % 9;
        const y = i / 9 | 0;
        const d = table.get(x, y);

        if(d[0] === 9){
          d[0] = d[1] = 0;
          i--;
          continue;
        }

        d[1] = d[0]++ === 0 ? 1 + grid.rand(9) : d[1] % 9 + 1;
        if(checkTable(x, y)) i++;
      }

      for(let y = 0; y !== 9; y++){
        for(let x = 0; x !== 9; x++){
          let d = center;

          for(let i = Math.abs(y - 4), dir = y < 4 ? 0 : 2; i !== 0; i--)
            d = this.adj(d, dir);

          for(let i = Math.abs(x - 4), dir = x < 4 ? 3 : 1; i !== 0; i--)
            d = this.adj(d, dir);

          new cs.Ground(
            d,
            (x / 3 ^ y / 3) & 1,
            DigitType.GIVEN,
            table.get(x, y)[1],
          );
        }
      }

      break;
    }

    this.endGen();
  }
}

module.exports = Generator;