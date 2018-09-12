'use strict';

const ExpandableGrid = require('./expandable-grid');
const Tile = require('./tile');
const CoordinatesCollection = require('./coords');

var {stats} = Tile;

class LandGrid extends ExpandableGrid{
  constructor(w, h, func=null, x=0, y=0){
    super(w, h, func, x, y);

    this.set(0, 0, Tile.initial());
  }

  tick(){
    var genColl = new CoordinatesCollection();
    var cs = [0, 0];

    this.iterate(1, (x, y, d) => {
      if(d === null) return;

      if(d.status === stats.GENERATING) genColl.add(x, y);
    });

    while(!genColl.isEmpty()){
      var [x, y] = genColl.rand(cs);
      if(!this.isVisible(x, y, 1)) continue;

      var d = this.get(x, y);
      if(d.status !== stats.GENERATING) continue;

      var {sti, dirs} = d;

      do{
        var dir = randDir(dirs);
        dirs &= ~(1 << dir);

        dir = dir + 2 & 3;
        var x1 = x, y1 = y;

        if(dir === 0) y1--;
        else if(dir === 1) x1++;
        else if(dir === 2) y1++;
        else if(dir === 3) x1--;

        var dNew = this.get(x1, y1);

        if(dNew === null){
          dNew = new Tile();
          this.set(x1, y1, dNew);
        }else if(dNew.status === stats.DONE){
          continue;
        }

        dNew.update(d, sti, dir);
        if(dNew.status === stats.GENERATING && this.isVisible(x1, y1, 1))
          genColl.add(x1, y1);
      }while(dirs !== 0);

      d.setDirs(0);
      if(d.status === stats.GENERATING) genColl.add(x, y);

      break;
    }
  }

  draw(x, y, g){
    this.iterate(x, y, (x, y, d) => {
      if(d === null) return;
      //if(d.status === stats.GENERATING) return;
      //if(d.status === stats.READY) d.done();

      g.translate(x, y);
      d.draw(g);
      g.translate(-x, -y);
    });
  }
};

module.exports = LandGrid;

function randDir(dirs){
  var num = 4 - (!(dirs & 1) + !(dirs & 2) + !(dirs & 4) + !(dirs & 8));
  var index = O.rand(num);

  for(var i = 0; i < 4; i++){
    if((dirs & 1) === 1 && index-- === 0) break;
    dirs >>= 1;
  }

  return i;
}