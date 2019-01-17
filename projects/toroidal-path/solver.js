'use strict';

const COLORIZED = 0;

class Solver{
  constructor(gui){
    this.gui = gui;
    this.grid = gui.grid;
    this.gen = this.solve();

    this.active = 1;
    this.solved = 0;
  }

  *solve(){
    const {gui, grid} = this;

    const cc = new O.CoordsColle();
    const v = new O.Vector();

    grid.iter((x, y, d) => {
      if(d.wall || d.dirs) return;
      if(!grid.adj(x, y, 1, (x, y, d) => !(d.wall || d.dirs))) return;
      cc.add(x, y);
    });

    while(cc.len()){
      cc.rand(v, 1);

      while(1){
        const {x, y} = v;
        const dirs = [];

        grid.adj(x, y, 1, (x, y, d, dir) => {
          if(!(d.wall || d.dirs))
            dirs.push(dir);
        });

        if(dirs.length === 0) break;

        const dir = O.randElem(dirs);
        grid.nav(v, dir, 1);
        cc.del(v.x, v.y);

        yield gui.emit('dragm', x, y, v.x, v.y, dir);
      }
    }

    if(COLORIZED)
      yield gui.emit('kKeyW');

    cc.reset();

    grid.iter((x, y, d) => {
      if(d.wall || !((1 << d.dirs) & 279)) return;
      cc.add(x, y);
    });

    while(cc.len()){
      const {x, y} = cc.rand(v);

      const sx = x, sy = y;
      const sd = grid.get(x, y).dirs;

      const path = grid.path(x, y, 1, 0, (x, y, d, xp, yp, dir, wd, path) => {
        if(d.wall) return 0;

        {
          let {dirs} = d;
          if(path.length & 1) dirs ^= 15;
          if(!((1 << (dir ^ 2)) & dirs)) return 0;
        }
        
        if((1 << d.dirs) & 279){
          if((1 << (dir ^ 2)) & d.dirs) return 0;
          if(x === sx && y === sy && sd) return 0;
          return 2;
        }

        return 1;
      });

      if(!path) return;

      for(const dir of path){
        const {x, y} = v;
        grid.nav(v, dir, 1);

        yield gui.emit('dragm', x, y, v.x, v.y, dir);
      }

      if(!((1 << grid.get(x, y).dirs) & 279))
        cc.del(x, y);

      if(!((1 << grid.get(v.x, v.y).dirs) & 279))
        cc.del(v.x, v.y);
    }

    const tilesNum = grid.count((x, y, d) => !d.wall);

    grid.find(v, (x, y, d) => !d.wall);
    const {x: ax, y: ay} = v;

    connectShapes: while(1){
      cc.reset(ax, ay);

      grid.iterAdj(ax, ay, 1, (x, y, d, xp, yp, dir) => {
        if(d.wall) return 0;
        if(!(d.dirs & (1 << (dir ^ 2)))) return 0;
        cc.add(x, y);
        return 1;
      });

      if(cc.len() === tilesNum) break;

      for(const [sx, sy] of cc){
        if(!grid.adj(sx, sy, 1, (x, y, d) => {
          return !(d.wall || cc.has(x, y));
        })) continue;

        const path = grid.path(sx, sy, 1, 0, (x, y, d, xp, yp, dir, wd, path) => {
          if(d.wall) return 0;

          {
            let {dirs} = d;
            if(!(path.length & 1)) dirs ^= 15;
            if(!((1 << (dir ^ 2)) & dirs)) return 0;
          }
          
          if(x === sx && y === sy){
            if((1 << (dir ^ 2)) & d.dirs) return 0;
            return 2;
          }

          if(cc.has(x, y)) { if(path.length === 2) return 0; }
          else if(path.length === 1) return 0;

          return 1;
        });

        if(!path) continue;

        v.x = sx;
        v.y = sy;

        for(const dir of path){
          const {x, y} = v;
          grid.nav(v, dir, 1);

          yield gui.emit('dragm', x, y, v.x, v.y, dir);
        }

        continue connectShapes;
      }

      return;
    }

    this.solved = 1;
  }

  move(){
    if(!this.active) return 0;

    if(this.gen.next().done){
      this.active = 0;
      return 0;
    }

    return 1;
  }
};

module.exports = Solver;