'use strict';

const Tree = require('./tree');

const {min, max, floor, ceil, atan2} = Math;
const {pi, pih, pi2} = O;

const DEPTH_MAX = 16;

const main = () => {
  const {g, w, h, wh, hh} = O.ceCanvas();
  const imgd = new O.ImageData(g);

  const radius = min(wh, hh);
  const tree = new Tree();

  const black = new Uint8ClampedArray([0, 0, 0]);
  const col = new Uint8ClampedArray(3);

  imgd.iter((x, y) => {
    const dist = O.dist(x, y, wh, hh);
    if(dist > radius) return black;

    const angle = atan2(hh - y, wh - x) + pi;
    const depth = O.bound(floor(radius / (radius - dist) ** .95) - 1, 0, DEPTH_MAX);
    const id = angle / pi2;

    const k = depth / DEPTH_MAX;
    O.hsv(k, col);

    if(!tree.get(id, depth)){
      col[0] /= 10;
      col[1] /= 10;
      col[2] /= 10;
    }

    return col;
  });

  imgd.put();
};

main();