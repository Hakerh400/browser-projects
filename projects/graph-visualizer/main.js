'use strict';

const {min, max, sin, cos, atan2} = Math;

const NODE_RADIUS = 16;
const GRAPH_RADIUS_FACTOR = .8;
const ARROW_SIZE = 10;

const {g, w, h, wh, hh} = O.ceCanvas();

const main = () => {
  const n = 10;
  const ns = O.ca(n, () => []);
  const root = ns[0];

  for(let i = 0; i !== n; i++)
    ns[i].push(ns[(i + 1) % n], ns[(i + 2) % n]);

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

  log(root[0] === ns[1]);

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

      const angle1 = map.get(ptr) / num * O.pi2 - O.pih;
      const x1 = cos(angle1) * r;
      const y1 = sin(angle1) * r;

      const dir = atan2(y - y1, x - x1);
      const dir1 = dir;
      const ax = x1 + cos(dir1);
      const ay = y1 + sin(dir1);

      g.fillStyle = ptri === 0 ? '#00f' : '#f00';
      g.strokeStyle = ptri === 0 ? '#00f' : '#f00';

      g.beginPath();
      g.moveTo(x, y);
      // O.arc(g, x, y, x1, y1, 1);
      g.lineTo(x1, y1);
      g.stroke();

      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(ax + cos(dir1 - aa) * as, ay + sin(dir1 - aa) * as);
      g.lineTo(ax + cos(dir1 + aa) * as, ay + sin(dir1 + aa) * as);
      g.fill();
    }

    g.fillStyle = 'white';
    g.strokeStyle = 'black';
    g.beginPath();
    g.arc(x, y, 1, 0, O.pi2);
    g.fill();
    g.stroke();

    g.fillStyle = 'black';
    g.fillText(i + 1, x, y);
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