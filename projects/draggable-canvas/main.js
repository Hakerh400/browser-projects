'use strict';

const DraggableCanvas = require('.');

const main = () => {
  O.body.classList.add('has-canvas');

  const dc = new DraggableCanvas(O.body);
  const {g} = dc;

  dc.setResizable(1);

  let t = O.now
  dc.render((x1, y1, x2, y2) => {
    // x1 = Math.floor(x1);
    // y1 = Math.floor(y1);

    for(let y = y1 - 1; y < y2 + 1; y += 40){
      for(let x = x1 - 1; x < x2 + 1; x += 40){
        g.fillStyle = O.Color.hsv(O.hypot(x, y) / 1e3 % 1);
        g.fillRect(x - 15, y - 15, 30, 30);
      }
    }
  });
};

main();