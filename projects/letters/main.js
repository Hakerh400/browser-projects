'use strict';

const {min, max} = Math;

const FACTOR = .8;

const {g, w, h, wh, hh} = O.ceCanvas();

const main = () => {
  const coords = [
    [62.0, 58.4],
    [57.5, 56.0],
    [51.7, 56.0],
    [67.9, 19.6],
    [57.7, 42.1],
    [54.2, 29.1],
    [46.0, 45.1],
    [34.7, 45.1],
    [45.7, 25.1],
    [34.7, 26.4],
    [28.4, 31.7],
    [33.4, 60.5],
    [22.9, 32.7],
    [21.5, 45.8],
    [15.3, 37.8],
    [15.1, 49.6],
    [9.1, 52.8],
    [9.1, 40.3],
    [2.7, 56.8],
    [2.7, 33.1],
  ];

  const [xMin, yMin, xMax, yMax] = coords.reduce(([xMin, yMin, xMax, yMax], [x, y]) => {
    return [min(x, xMin), min(y, yMin), max(x, xMax), max(y, yMax)];
  }, coords[0].concat(coords[0]));

  const dx = xMax - xMin;
  const dy = yMax - yMin;

  const s = min(w / dx * FACTOR, h / dy * FACTOR);
  const x1 = wh - dx * s / 2;
  const y1 = hh - dy * s / 2;

  for(const cs of coords){
    cs[0] = cs[0] - dx / 2;
    cs[1] = yMin + yMax - cs[1] - dy / 2;
  }

  g.font = '72px arial';
  g.fillStyle = 'black';

  for(let i = 0; i !== coords.length; i++){
    const [x, y] = coords[i];
    g.fillText(O.sfcc(O.cc('A') + i), x1 + (x - xMin + dx / 2) * s, y1 + (y - yMin + dy / 2) * s);
  }
};

main();