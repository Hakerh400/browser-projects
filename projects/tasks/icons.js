'use strict';

module.exports = {
  getIcons,
};

async function getIcons(cb = O.nop){
  var iconsArr = await new Promise(res => {
    O.require('icons-ctxs.js', icons => {
      res(icons);
    });
  });

  var icons = Object.create(null);

  await new Promise(res => {
    var num = iconsArr.length;

    for(var i = 0; i < iconsArr.length; i++){
      var [name, w, h, func] = iconsArr[i];

      var canvas = O.doc.createElement('canvas');
      canvas.width = w;
      canvas.height = h;

      var g = canvas.getContext('2d');
      g.clearRect(0, 0, w, h);
      g.globalCompositeOperation = 'xor';
      g.fillStyle = 'black';
      g.strokeStyle = 'rgba(0,0,0,0)';

      func(g);

      canvas.toBlob((name => blob => {
        var url = URL.createObjectURL(blob);
        icons[name] = url;

        if(--num === 0)
          res();
      })(name));
    }
  });

  return icons;
}