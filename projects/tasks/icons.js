'use strict';

module.exports = {
  getIcons,
};

async function getIcons(cb=O.nop){
  var icons = Object.create(null);

  await new Promise(res => {
    O.require('icons-ctxs.js', iconsArr => {
      iconsArr.forEach(([name, w, h, func]) => {
        icons[name] = [w, h, func];
      });

      res();
    });
  });

  return {
    add(name, col='#000000', scale=1, classNames=null){
      var [w, h, func] = icons[name];

      w *= scale;
      h *= scale;

      var canvas = O.ce(null, 'canvas', classNames);
      canvas.width = w;
      canvas.height = h;

      var g = canvas.getContext('2d');
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = 'xor';
      g.fillStyle = col;
      g.strokeStyle = 'rgba(0,0,0,0)';
      g.scale(scale, scale);

      func(g);

      return g.canvas;
    },
  };
}