'use strict';

const Tree = require('./tree');

const {min, max, floor, ceil, atan2} = Math;
const {pi, pih, pi2} = O;

const DEPTH_MAX = 16;

const main = () => {
  const {g, w, h, wh, hh} = O.ceCanvas();
  const imgd = new O.ImageData(g);

  const radius = O.hypot(wh, hh) + 5;
  const tree = new Tree();

  const black = new Uint8ClampedArray([0, 0, 0]);
  const col = new Uint8ClampedArray(3);

  imgd.iter((x, y) => {
    const dist = O.dist(x, y, wh, hh);
    if(dist > radius) return black;

    const angle = atan2(hh - y, wh - x) + pi;
    const depth = O.bound(floor(radius / (radius - dist) ** .7) - 8, 0, DEPTH_MAX);
    const id = angle / pi2;

    return tree.get(id, depth);
  });

  imgd.put();
};

main();