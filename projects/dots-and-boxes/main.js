'use strict';

const DraggableCanvas = require('../draggable-canvas');

const {floor, round} = Math;

const TILE_SIZE = 40;
const DOT_RADIUS = .15;
const DOT_SHADOW_OFFSET = DOT_RADIUS / 5;
const LINE_CURVATURE = .135;

const cols = {
  bg: [213, 238, 243],
  dot: [255, 255, 255],
  dotShadow: [125, 144, 147],
  line: [69, 137, 143],
  firstPlayer: [53, 217, 244],
  secondPlayer: [254, 61, 64],
};

const main = () => {
  O.body.classList.add('has-canvas');

  for(const colName of O.keys(cols)){
    const col = cols[colName];
    cols[colName] = O.Color.from(col).toString();
  }

  const dc = new DraggableCanvas(O.body);
  const {g} = dc;

  dc.defaultScale = TILE_SIZE;
  dc.defaultLineWidth = 1 / TILE_SIZE;
  dc.scale = TILE_SIZE;
  dc.bgCol = cols.bg;

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '8px arial';

  dc.update();

  const grid = new O.Map2D();

  let nextLine = null;
  let currentPlayer = 0;

  const calcNextLine = (x, y) => {
    x += .5;
    y += .5;

    let xx = floor(x);
    let yy = floor(y);
    let xf = x - xx;
    let yf = y - yy;
    let type;

    if(xf > yf){
      if(xf < 1 - yf){
        type = 0;
      }else{
        type = 1;
        xx++;
      }
    }else{
      if(yf < 1 - xf){
        type = 1;
      }else{
        type = 0;
        yy++;
      }
    }

    nextLine = [xx, yy, type];
  };

  const checkClosedSquares = (x, y, type) => {
    const a = checkClosedSquare(x, y);
    const b = type === 0 ?
      checkClosedSquare(x, y - 1) :
      checkClosedSquare(x - 1, y);

    if(!(a || b)) currentPlayer ^= 1;
  };

  const checkClosedSquare = (x, y) => {
    if(!(grid.has(x + 1, y) && grid.has(x, y + 1)))
      return 0;

    const a = grid.get(x, y);
    const b = grid.get(x + 1, y);
    const c = grid.get(x, y + 1);

    if((a & 3) === 3 && (b & 2) && (c & 1)){
      grid.set(x, y, a | (currentPlayer + 1 << 2));
      return 1;
    }

    return 0;
  };

  dc.renderFunc = (x1, y1, x2, y2) => {
    x1 = floor(x1);
    y1 = floor(y1);

    for(let y = y1 - 2; y < y2 + 2; y++){
      for(let x = x1 - 2; x < x2 + 2; x++){
        if(!grid.has(x, y)) continue;

        const data = grid.get(x, y);
        const ownedBy = data >> 2;

        if(ownedBy !== 0){
          g.fillStyle = ownedBy === 1 ? cols.firstPlayer : cols.secondPlayer;
          g.fillRect(x - .5, y - .5, 1, 1);
        }
      }
    }

    g.fillStyle = cols.line;

    for(let y = y1 - 2; y < y2 + 2; y++){
      for(let x = x1 - 2; x < x2 + 2; x++){
        if(!grid.has(x, y)) continue;

        const data = grid.get(x, y);
        if(data === 0) continue;

        if(data & 1){
          g.beginPath();
          g.moveTo(x - .5, y - .5 - DOT_RADIUS);
          O.arc(g, x - .5, y - .5 - DOT_RADIUS, x + .5, y - .5 - DOT_RADIUS, -LINE_CURVATURE);
          g.lineTo(x + .5, y - .5 + DOT_RADIUS);
          O.arc(g, x + .5, y - .5 + DOT_RADIUS, x - .5, y - .5 + DOT_RADIUS, -LINE_CURVATURE);
          g.closePath();
          g.fill();
        }

        if(data & 2){
          g.beginPath();
          g.moveTo(x - .5 - DOT_RADIUS, y - .5);
          O.arc(g, x - .5 - DOT_RADIUS, y - .5, x - .5 - DOT_RADIUS, y + .5, LINE_CURVATURE);
          g.lineTo(x - .5 + DOT_RADIUS, y + .5);
          O.arc(g, x - .5 + DOT_RADIUS, y + .5, x - .5 + DOT_RADIUS, y - .5, LINE_CURVATURE);
          g.closePath();
          g.fill();
        }
      }
    }

    drawNextLine: if(nextLine !== null){
      const [x, y, type] = nextLine;
      const data = grid.has(x, y) ? grid.get(x, y) : 0;
      if(data & (1 << type)) break drawNextLine;

      g.fillStyle = currentPlayer === 0 ? cols.firstPlayer : cols.secondPlayer;
      g.globalAlpha = .5;
      g.beginPath();
      if(type === 0){
        g.moveTo(x - .5, y - .5 - DOT_RADIUS);
        O.arc(g, x - .5, y - .5 - DOT_RADIUS, x + .5, y - .5 - DOT_RADIUS, -LINE_CURVATURE);
        g.lineTo(x + .5, y - .5 + DOT_RADIUS);
        O.arc(g, x + .5, y - .5 + DOT_RADIUS, x - .5, y - .5 + DOT_RADIUS, -LINE_CURVATURE);
      }else{
        g.moveTo(x - .5 - DOT_RADIUS, y - .5);
        O.arc(g, x - .5 - DOT_RADIUS, y - .5, x - .5 - DOT_RADIUS, y + .5, LINE_CURVATURE);
        g.lineTo(x - .5 + DOT_RADIUS, y + .5);
        O.arc(g, x - .5 + DOT_RADIUS, y + .5, x - .5 + DOT_RADIUS, y - .5, LINE_CURVATURE);
      }
      g.closePath();
      g.fill();
      g.globalAlpha = 1;
    }

    for(let y = y1 - 2; y < y2 + 2; y++){
      for(let x = x1 - 2; x < x2 + 2; x++){
        g.fillStyle = cols.dotShadow;
        g.beginPath();
        g.arc(x - .5 + DOT_SHADOW_OFFSET, y - .5 + DOT_SHADOW_OFFSET, DOT_RADIUS, 0, O.pi2);
        g.fill();
        g.fillStyle = cols.dot;
        g.beginPath();
        g.arc(x - .5, y - .5, DOT_RADIUS, 0, O.pi2);
        g.fill();
      }
    }
  };

  dc.onMouseDown = (evt, x, y) => {
    calcNextLine(x, y);
    if(nextLine === null) return;

    putNextLine: {
      const [x, y, type] = nextLine;
      const bit = 1 << type;

      if(!grid.has(x, y)){
        grid.set(x, y, bit);
        checkClosedSquares(x, y, type);
        break putNextLine;
      }

      const data = grid.get(x, y);
      if(data & bit) break putNextLine;

      grid.set(x, y, data | bit);
      checkClosedSquares(x, y, type);
    }
  };

  dc.onMouseMove = (evt, x, y) => {
    calcNextLine(x, y);
  };

  dc.setResizable(1);
};

main();