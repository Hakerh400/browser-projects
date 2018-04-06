'use strict';

game.levels = 1;

game.draw = (x, y, d, g) => {
  g.fillStyle = ['#00ffff', '#008080'][d[1]];
  g.fillRect(x, y, 1, 1);
  g.fillStyle = '#00ff00';
  game.tube(x, y, d[0]);
};

game.export = (x, y, d, bs) => {
  bs.write(d[0], 15);
  bs.write(d[1], 1);
};

game.import = (x, y, d, bs) => {
  d[0] = bs.read(15);
  d[1] = bs.read(1);
};

game.generate = () => {
  var {w, h} = game;
  game.iterate((x, y, d) => d[0] = d[1] = 0);
  var [x, y] = [w, h].map(a => a >> 1);
  var id = game.getId();
  var d = game.get(x, y);
  var queue = [[x, y, d]];
  while(queue.length !== 0){
    [x, y, d] = queue.splice(O.rand(queue.length), 1)[0];
    if(d.id === id) continue;
    d.id = id;
    var dirs = [];
    for(var dir = 0; dir < 4; dir++){
      var x1 = x + (dir === 1 ? -1 : dir === 3 ? 1 : 0);
      var y1 = y + (dir === 0 ? -1 : dir === 2 ? 1 : 0);
      var d1 = game.get(x1, y1);
      if(d1 === null) continue;
      var ddir1 = 1 << dir;
      var ddir2 = 1 << (dir + 2 & 3);
      if(d1.id === id){
        if((d[0] | ddir1) === 15 || (d1[0] | ddir2) === 15) continue;
        dirs.push([d1, dir]);
      }else{
        queue.push([x1, y1, d1]);
      }
    }
    if(dirs.length !== 0){
      var [d1, dir] = dirs[O.rand(dirs.length)];
      d[0] |= 1 << dir;
      d1[0] |= 1 << (dir + 2 & 3);
    }
  }
  game.iterate((x, y, d) => {
    d[0] = ((d[0] | (d[0] << 4)) >> O.rand(4)) & 15;
  });
};

game.mouse.lmb = (x, y, d) => {
  if(d[1]) return;
  d[0] = ((d[0] | (d[0] << 4)) >> 1) & 15;
};

game.mouse.rmb = (x, y, d) => {
  d[1] ^= 1;
};