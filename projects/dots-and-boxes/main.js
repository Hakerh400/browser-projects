'use strict';

const DraggableCanvas = require('../draggable-canvas');
const LS = require('./local-strings');
const Button = require('./button');
const BGShape = require('./bg-shape');
const fileLoader = require('./file-loader');
const colors = require('./colors');
const links = require('./links');

const {min, max, floor, round, sin, cos} = Math;
const {pi, pi2, pih, pi4, pi32, pi34} = O;

const BTN_WIDTH = 400;
const BTN_HEIGHT = 50;
const BTN_CORNER_RADIUS = 15;
const BTN_SPACE = 10;
const BTN_SELECTED_SCALE = 1.1;
const BTN_RESIZE_TIME = .25e3;

const BG_SHAPES_NUM = 10;
const BG_SHAPE_DIAM = [30, 80];
const BG_SHAPE_SPEED = [1, 2];
const BG_SHAPE_ROT_SPEED = [pi / 300, pi / 150];

const TILE_SIZE = 40;
const DOT_RADIUS = .15;
const DOT_SHADOW_OFFSET = DOT_RADIUS / 5;
const LINE_CURVATURE = .135;

const main = () => {
  O.body.classList.add('has-canvas');

  for(const dcType of O.keys(colors)){
    const cols = colors[dcType];

    for(const colName of O.keys(cols)){
      const col = cols[colName];
      cols[colName] = O.Color.from(col).toString();
    }
  }

  const {titles, buttons: btns} = LS.menu;

  const opts = O.arr2obj([
    'play',
    'gameMode',
    'grid',
    'level',
    'depth',
    'stepByStep',
  ], null);

  const onPickOpt = opt => {
    if(opts.play === null){
      if(opt === 1){
        menu.pause();
        location.href = links.gameInfo;
        return;
      }

      opts.play = 1;

      return menu.update(titles.gameMode, [
        btns.humanVsHuman,
        btns.humanVsComputer,
        btns.computerVsComputer,
      ]);
    }

    if(opts.gameMode === null){
      opts.gameMode = opt;

      return menu.update(titles.createGame, [
        btns.newGame,
        btns.loadGame,
      ]);
    }

    if(opts.grid === null){
      menu.pause();

      fileLoader.load().then(buf => {
        log(buf.toString());
      }).catch(err => {
        menu.resume();
      });

      return;
    }
  };

  const menu = new Menu(titles.intro, [
    btns.play,
    btns.info,
  ], onPickOpt);

  menu.show();
};

const createDc = () => {
  const dc = new DraggableCanvas(O.body);
  const {g} = dc;

  dc.setHomeBtn('Home');

  g.lineWidth = 1 / TILE_SIZE;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.textBaseline = 'middle';
  g.textAlign = 'center';

  return dc;
};
class Menu{
  constructor(title, btns, cb){
    this.update(title, btns, cb);

    const dc = this.dc = createDc();
    const {g} = dc;
    const t = O.now;

    const cols = colors.menu;

    const bw1 = this.bw1 = BTN_WIDTH;
    const bh1 = this.bh1 = BTN_HEIGHT;
    const bw2 = this.bw2 = bw1 * BTN_SELECTED_SCALE;
    const bh2 = this.bh2 = bh1 * BTN_SELECTED_SCALE;
    const br = BTN_CORNER_RADIUS;
    const dt = BTN_RESIZE_TIME;
    const shd = BG_SHAPE_DIAM[1];

    const createBGShape = (t, x, y) => {
      const r = O.randf(BG_SHAPE_DIAM[0], BG_SHAPE_DIAM[1]) / 2;
      const verts = O.randInt(3, .5);
      const dir = -O.randf(pih);
      const rot = O.randf(pi2);
      const speed = O.randf(BG_SHAPE_SPEED[0], BG_SHAPE_SPEED[1]);
      const rotSpeed = O.randf(BG_SHAPE_ROT_SPEED[0], BG_SHAPE_ROT_SPEED[1]) * (O.rand(2) ? 1 : -1);

      return new BGShape(t, x, y, r, verts, dir, rot, speed, rotSpeed);
    };

    const bgShapes = O.ca(BG_SHAPES_NUM, () => {
      const {wh, hh} = dc;

      return createBGShape(t, O.randf(-wh, wh), O.randf(-hh, hh));
    });

    dc.setBg(cols.bg);
    dc.lock();

    const select = index => {
      const {btns} = this;
      const t = O.now;

      if(this.selectedIndex !== -1){
        const btn = btns[this.selectedIndex];
        const {tr} = btn;

        if(tr === null) btn.tr = [t, 1, 0];
        else btn.tr = [t, tr[1] + (t - tr[0]) / dt * min((tr[2] - tr[1]), 1), 0];

        btn.selected = 0;
      }

      const btn = btns[index];
      const {tr} = btn;
      
      if(tr === null) btn.tr = [t, 0, 1];
      else btn.tr = [t, tr[1] + (t - tr[0]) / dt * min((tr[2] - tr[1]), 1), 1];

      btn.selected = 1;
      this.selectedIndex = index;
    };

    dc.renderFunc = (x1, y1, x2, y2) => {
      const {title, btns} = this;
      const {wh, hh} = dc;
      const t = O.now;

      g.strokeStyle = cols.bgShape;
      g.lineWidth = 5;

      for(let i = 0; i !== BG_SHAPES_NUM; i++){
        const shape = bgShapes[i];
        const {dir, speed} = shape;

        const dt = (t - shape.t) / 60;
        const offset = dt * speed;
        const rot = shape.rot + shape.rotSpeed * dt;

        const x = shape.x + cos(dir) * offset;
        const y = shape.y + sin(dir) * offset;

        if(x > x2 + shd || y < y1 - shd){
          const d = BG_SHAPE_DIAM[1] * 2;

          const shape = O.rand(2) ?
            createBGShape(t, -wh - d, O.randf(-hh, hh)) :
            createBGShape(t, O.randf(-wh, wh), hh + d);

          bgShapes[i] = shape;
          continue;
        }

        g.beginPath();
        O.drawPolygon(g, x, y, shape.r, shape.verts, rot);
        g.stroke();
      }

      dc.font = 50;
      g.lineWidth = 7;
      g.fillStyle = cols.titleFill;
      g.strokeStyle = cols.titleStroke;
      g.strokeText(title, 0, -hh + 85);
      g.fillText(title, 0, -hh + 85);
      dc.font = 24;

      let y = (btns.length - 1) * BTN_SPACE;
      for(const btn of btns) y += btn.h;
      y = -y / 2;

      for(const btn of btns){
        let {tr} = btn;

        if(tr !== null && t - tr[0] > BTN_RESIZE_TIME)
          tr = btn.tr = null;

        const k = tr !== null ?
          tr[1] + (t - tr[0]) / dt * (tr[2] - tr[1]) :
          btn.selected ? 1 : 0;

        const bw = btn.w = bw1 + (bw2 - bw1) * k;
        const bh = btn.h = bh1 + (bh2 - bh1) * k;
        const bwh = bw / 2;
        const bhh = bh / 2;

        y += bhh;

        g.lineWidth = 2;
        g.strokeStyle = cols.line;
        g.beginPath();
        g.arc(-bwh + br, y - bhh + br, br, pi, pi32);
        g.lineTo(bwh - br, y - bhh);
        g.arc(bwh - br, y - bhh + br, br, pi32, pi2);
        g.lineTo(bwh, y + bhh - br);
        g.arc(bwh - br, y + bhh - br, br, 0, pih);
        g.lineTo(-bwh + br, y + bhh);
        g.arc(-bwh + br, y + bhh - br, br, pih, pi);
        g.closePath();
        g.fillStyle = cols.btn;
        g.fill();
        g.globalAlpha = k;
        g.fillStyle = cols.btnSelected;
        g.fill();
        g.globalAlpha = 1;
        g.stroke();

        g.fillStyle = cols.btnText;
        g.fillText(btn.label, 0, y);

        if(btn.selected){
          g.lineWidth = 1;
          g.fillStyle = cols.btnCursor;
          g.beginPath();
          O.drawStar(g, -bwh - bhh, y, bhh * .15, bhh * .5, 5, O.now / 2e3);
          g.fill();
          g.stroke();
        }

        y += bhh + BTN_SPACE;
      }
    };

    dc.onKeyDown = evt => {
      const {btns, selectedIndex} = this;

      switch(evt.code){
        case 'ArrowUp':
          select((selectedIndex + btns.length - 1) % btns.length);
          break;

        case 'ArrowDown':
          select((selectedIndex + 1) % btns.length);
          break;

        case 'Enter':
          this.cb(selectedIndex);
          break;
      }
    };
  }

  show(cb){
    this.dc.show(cb);
    return this;
  }

  hide(cb){
    this.dc.hide(cb);
    return this;
  }

  pause(){
    this.dc.pause();
    return this;
  }

  resume(){
    this.dc.resume();
    return this;
  }

  replaceWith(dc, cb){
    this.dc.replaceWith(dc, cb);
    return this;
  }

  remove(cb){
    this.dc.remove(cb);
    return this;
  }

  update(title, btns, cb=this.cb){
    const {bw1, bh1, bw2, bh2} = this;

    this.btns = btns.map((label, index) => {
      if(index === 0) return new Button(label, bw2, bh2, 1);
      return new Button(label, bw1, bh1, 0);
    });

    this.title = title;
    this.cb = cb;
    this.selectedIndex = 0;

    return this;
  }
};

const createWorld = () => {
  const dc = createDc();
  const {g} = dc;

  const cols = colors.world;

  dc.setScale(TILE_SIZE);
  dc.setBg(cols.bg);

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
          O.drawArc(g, x - .5, y - .5 - DOT_RADIUS, x + .5, y - .5 - DOT_RADIUS, -LINE_CURVATURE);
          g.lineTo(x + .5, y - .5 + DOT_RADIUS);
          O.drawArc(g, x + .5, y - .5 + DOT_RADIUS, x - .5, y - .5 + DOT_RADIUS, -LINE_CURVATURE);
          g.closePath();
          g.fill();
        }

        if(data & 2){
          g.beginPath();
          g.moveTo(x - .5 - DOT_RADIUS, y - .5);
          O.drawArc(g, x - .5 - DOT_RADIUS, y - .5, x - .5 - DOT_RADIUS, y + .5, LINE_CURVATURE);
          g.lineTo(x - .5 + DOT_RADIUS, y + .5);
          O.drawArc(g, x - .5 + DOT_RADIUS, y + .5, x - .5 + DOT_RADIUS, y - .5, LINE_CURVATURE);
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
        O.drawArc(g, x - .5, y - .5 - DOT_RADIUS, x + .5, y - .5 - DOT_RADIUS, -LINE_CURVATURE);
        g.lineTo(x + .5, y - .5 + DOT_RADIUS);
        O.drawArc(g, x + .5, y - .5 + DOT_RADIUS, x - .5, y - .5 + DOT_RADIUS, -LINE_CURVATURE);
      }else{
        g.moveTo(x - .5 - DOT_RADIUS, y - .5);
        O.drawArc(g, x - .5 - DOT_RADIUS, y - .5, x - .5 - DOT_RADIUS, y + .5, LINE_CURVATURE);
        g.lineTo(x - .5 + DOT_RADIUS, y + .5);
        O.drawArc(g, x - .5 + DOT_RADIUS, y + .5, x - .5 + DOT_RADIUS, y - .5, LINE_CURVATURE);
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

  dc.onMouseLeave = (evt, x, y) => {
    nextLine = null;
  };

  return dc;
};

main();