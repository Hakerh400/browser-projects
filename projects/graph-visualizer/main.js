'use strict';

const {min, max, sqrt, sin, cos, atan2} = Math;

const NODE_RADIUS = 16;
const GRAPH_RADIUS_FACTOR = .8;
const ARROW_SIZE = 10;

const {g, w, h, wh, hh} = O.ceCanvas();

const main = () => {
  const n = 10;
  const ns = O.ca(n, () => []);
  const root = ns[0];

  for(let i = 0; i !== n; i++)
    ns[i].push(ns[(i + n - 1) % n], ns[(i + 1) % n]);

  render(root);
};

const render = root => {
  g.resetTransform();
  g.fillStyle = 'darkgray';
  g.fillRect(0, 0, w, h);

  const visited = new Set();
  const map = new Map();
  const stack = [root];
  const ns = [];

  while(stack.length !== 0){
    const node = stack.pop();
    if(visited.has(node)) continue;

    ns.push(node);
    visited.add(node);
    map.set(node, ns.length - 1);
    
    stack.push(node[1], node[0]);
  }

  const num = ns.length;
  const s = NODE_RADIUS;
  const r = min(wh, hh) * GRAPH_RADIUS_FACTOR / s;
  const as = ARROW_SIZE / s;
  const aa = O.pi / 8;

  g.translate(wh, hh);
  g.scale(s, s);
  g.lineWidth = 1 / s;
  g.font = `1px arial`;

  O.repeat(num, (i, k) => {
    const angle = k * O.pi2 - O.pih;
    const x = cos(angle) * r;
    const y = sin(angle) * r;

    const node = ns[i];

    for(let ptri = 0; ptri !== 2; ptri++){
      const ptr = node[ptri];

      const j = map.get(ptr);
      const a1 = j / num * O.pi2 - O.pih;
      const x1 = cos(a1) * r;
      const y1 = sin(a1) * r;

      const dir = atan2(y - y1, x - x1);

      g.fillStyle = ptri === 0 ? '#00f' : '#f00';
      g.strokeStyle = g.fillStyle;

      let ax, ay, dir1;

      if(i > j && (ptr[0] === node || ptr[1] === node)){
        g.beginPath();
        g.moveTo(x, y);
        const [mx, my] = O.arc(g, x, y, x1, y1, .5);
        g.stroke();

        const r2 = 1;
        const R2 = O.dists(mx, my, x, y);
        const a = mx, b = my;
        const c = x1, d = y1;
        const P = 2 * (a - c);
        const Q = R2 - a * a - b * b + c * c + d * d - r2;
        const db = d - b;
        const db2 = db * db;
        const M = Q - 4 * db * b;
        const A = 4 * db2 + P * P;
        const B = P * (M + Q) - 8 * a * db2;
        const C = Q * M - 4 * db2 * (R2 - a * a - b * b);
        const D = B * B - 4 * A * C;

        const p1 = -B / (2 * A);
        const p2 = -sqrt(D) / (2 * A);
        const ax1 = p1 + p2;
        const ax2 = p1 - p2;
        const ay1 = (P * ax1 + Q) / (2 * db);
        const ay2 = (P * ax2 + Q) / (2 * db);

        const d1 = O.dists(ax1, ay1, x, y);
        const d2 = O.dists(ax2, ay2, x, y);

        if(d1 < d2) ax = ax1, ay = ay1;
        else ax = ax2, ay = ay2;

        dir1 = atan2(b - ay, a - ax) + O.pih;
      }else{
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x1, y1);
        g.stroke();

        ax = x1 + cos(dir);
        ay = y1 + sin(dir);
        dir1 = dir;
      }

      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(ax + cos(dir1 - aa) * as, ay + sin(dir1 - aa) * as);
      g.lineTo(ax + cos(dir1 + aa) * as, ay + sin(dir1 + aa) * as);
      g.fill();
    }
  });

  O.repeat(num, (i, k) => {
    const angle = k * O.pi2 - O.pih;
    const x = cos(angle) * r;
    const y = sin(angle) * r;

    g.fillStyle = 'white';
    g.strokeStyle = 'black';
    g.beginPath();
    g.arc(x, y, 1, 0, O.pi2);
    g.fill();
    g.stroke();

    g.fillStyle = 'black';
    g.fillText(i + 1, x, y);
  });
};

const ser = root => {
  const nodes = new Map();
  const stack = [root];
  let index = 0;
  let arr = [];

  while(stack.length !== 0){
    const node = stack.pop();

    if(nodes.has(node)){
      arr.push(nodes.get(node));
      continue;
    }

    nodes.set(node, index);
    arr.push(index++);
    stack.push(node[1], node[0]);
  }

  return arr;
};

main();