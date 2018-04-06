'use strict';

const PSEUDO_RANDOM = 1;

const TILE_SIZE = 40;
const MAX_DIM = 100;
const MAX_DIM1 = MAX_DIM - 1;

window.setTimeout(main);

function main(){
  var name = O.urlParam('game');

  if(name === null) showGameList();
  else loadGame(name);
}

function showGameList(){
  O.rfLocal('games.txt', (status, data) => {
    if(status !== 200)
      return O.error('Cannot load game list.');

    var menu = O.ce(O.body, 'div');
    var h1 = O.ce(menu, 'h1');
    O.ceText(h1, 'Games');

    var gameList = O.ce(menu, 'div');
    var games = O.sortAsc(O.sanl(data));

    games.forEach((game, index) => {
      if(index !== 0) O.ceBr(gameList);

      var name = O.projectToName(game);
      var url = `/?project=${O.project}&game=${game}`;
      var link = O.ceLink(gameList, name, url);
    });
  });
}

function showLevelList(name, num){
  var menu = O.ce(O.body, 'div');
  var h1 = O.ce(menu, 'h1');
  O.ceText(h1, O.projectToName(name));

  var levelList = O.ce(menu, 'div');

  O.repeat(num, index => {
    if(index !== 0) O.ceBr(levelList);

    var levelName = `Level ${index + 1}`;
    var url = `/?project=${O.project}&game=${name}&level=${index + 1}`;
    var link = O.ceLink(levelList, levelName, url);
  });
}

function loadGame(name){
  O.rfLocal(`games/${name}.js`, (status, data) => {
    if(status !== 200)
      return O.error('Cannot load game.');

    var func = new Function('O', 'game', data);
    var game = new Game(name, func);
  });
}

class Game{
  constructor(name, func){
    this.name = name;
    this.func = func;

    this.grid = null;
    this.taObj = null;
    this.exportedGrid = null;
    this.randSeed = null;
    this.randParam = null;

    this.draw = null;
    this.import = null;
    this.export = null;
    this.generate = null;

    this.updated = 0;
    this.updates = createObj();

    this.cx = 0;
    this.cy = 0;

    this.init();
  }

  init(){
    this.kb = createObj();
    this.mouse = createObj();

    this.func(O, this);
    this.loadLevel(O.urlParam('level') || 1);
  }

  addEventListeners(){
    this.ael('keydown', evt => {
      this.restartUpdates();
      this.onKeyDown(evt);
      this.checkUpdates();
    });

    this.ael('mousedown', evt => {
      this.updateMouseCoords(evt);
      this.restartUpdates();
      this.onMouseDown(evt);
      this.checkUpdates();
    });

    this.ael('mousemove', evt => {
      this.updateMouseCoords(evt);
    });


    this.ael('contextmenu', evt => {
      evt.preventDefault();
    });
  }

  onKeyDown(evt){
    var {kb} = this;

    if(evt.code === 'Escape'){
      this.showTextArea(evt);
      return;
    }

    if(/^F\d+$/.test(evt.code)){
      var prevent = true;

      switch(evt.code){
        case 'F2': this.generateGrid(); break;
        case 'F3': this.restart(); break;
        case 'F5': window.location.reload(); break;
        default: prevent = false; break;
      }

      if(prevent)
        evt.preventDefault();

      return;
    }

    if(evt.ctrlKey){
      switch(evt.code){
        case 'ArrowLeft': this.prevLevel(); break;
        case 'ArrowRight': this.nextLevel(); break;
      }

      return;
    }

    if(!(evt.code in kb)){
      if('dir' in kb && /^Arrow/.test(evt.code)){
        var dir = -1;

        switch(evt.code){
          case 'ArrowUp': dir = 0; break;
          case 'ArrowLeft': dir = 1; break;
          case 'ArrowDown': dir = 2; break;
          case 'ArrowRight': dir = 3; break;
        }

        if(dir !== -1){
          var dx = dir === 1 ? -1 : dir === 3 ? 1 : 0;
          var dy = dir === 0 ? -1 : dir === 2 ? 1 : 0;

          kb.dir(dir, dx, dy);
        }

        return;
      }

      if('digit' in kb && /^(?:Digit|Numpad)/.test(evt.code)){
        var digit = evt.code.match(/\d/) | 0;
        kb.digit(digit);
        return;
      }

      return;
    }

    kb[evt.code]();
  }

  onMouseDown(evt){
    var {g, cx, cy} = this;

    var d = this.get(cx, cy);
    if(d === null) return;

    if(evt.button === 0){
      if('lmb' in this.mouse)
        this.mouse.lmb(x, y, d);
    }else if(evt.button === 2){
      if('rmb' in this.mouse)
        this.mouse.rmb(x, y, d);
    }
  }

  updateMouseCoords(evt){
    var {g} = this;
    this.cx = Math.floor((evt.clientX - g.tx) / g.s);
    this.cy = Math.floor((evt.clientY - g.ty) / g.s);
  }

  restartUpdates(){
    this.updated = 0;
    this.updates = createObj();
  }

  checkUpdates(){
    var {updates, g} = this;

    if(this.updated !== 0){
      this.seed(updates);

      for(var y in updates){
        var row = updates[y |= 0];
        for(var x in row){
          if((x |= 0) < 0) continue;
          this.drawFunc(x, y, row[x], g);
        }
      }
    }
  }

  createGrid(){
    this.grid = new O.TilesGrid();
    this.g = this.grid.g;
    this.canvas = this.g.canvas;

    var {grid} = this;

    grid.setWH(1, 1);
    grid.setSize(TILE_SIZE);
    grid.setTileParams(['d']);

    grid.setDrawFunc((x, y, d, g) => {
      this.drawFunc(x, y, d.d, g);
    });

    this.isCanvasVisible = true;
    this.addEventListeners();
  }

  loadLevel(level = 1){
    if(level === null)
      return showLevelList(this.name, this.levels);

    this.level = level | 0;

    O.rfLocal(`levels/${this.name}/${this.level}.txt`, (status, data) => {
      if(status !== 200)
        return O.error('Cannot load level.');

      this.importGrid(data);
    });
  }

  loadGrid(w, h, bs = null){
    this.w = w;
    this.h = h;

    if(this.grid === null) this.createGrid();
    if(this.taObj === null) this.createTextArea();

    var {grid} = this;
    grid.setWH(w, h);

    this.arr = createIntArr(this);

    grid.create((x, y) => {
      var d = createIntArr(this, x, y);
      this.import(x, y, d, bs);
      return [d];
    });

    this.exportedGrid = this.exportGrid();
    this.randSeed = this.exportedGrid.substring(0, 16);
  }

  generateGrid(){
    if(this.generate === null)
      return;

    this.generate();
    this.importGrid(this.exportGrid());
  }

  drawGrid(){
    this.grid.draw();
  }

  drawFunc(x, y, d, g){
    this.draw(x, y, d, g);
    this.grid.drawFrame(x, y);
  }

  exportGrid(){
    var bs = new O.BitStream();

    bs.write(this.w - 1, MAX_DIM1);
    bs.write(this.h - 1, MAX_DIM1);

    this.grid.iterate((x, y, d) => {
      this.export(x, y, d.d, bs);
    });

    bs.pack();
    return bs.stringify(true);
  }

  importGrid(str){
    if(0){
      var bs = new O.BitStream();
      var w = 4;
      var h = 4;
      bs.write(w - 1, MAX_DIM1);
      bs.write(h - 1, MAX_DIM1);

      for(var y = 0; y < h; y++){
        for(var x = 0; x < w; x++){
          if(x === 1 && y == 1 || x === 2 && y === 2){
            bs.write(1, 30);
          }else{
            bs.write(0, 30);
          }
        }
      }

      bs.pack();
      var str = bs.stringify(true);
    }

    /////////////////////////////////////////////////////////////

    this.exportedGrid = null;
    this.randSeed = null;
    this.randParam = null;

    var bs = getBs(str);
    if(bs === null)
      return O.error('Unrecognized level format.');

    var w = 1 + bs.read(MAX_DIM1);
    var h = 1 + bs.read(MAX_DIM1);

    this.loadGrid(w, h, bs);
    this.drawGrid();
  }

  restart(){
    if(this.exportedGrid === null) return;
    this.importGrid(this.exportedGrid);
  }

  createTextArea(){
    var taObj = this.taObj = createObj();

    var div = O.ce(O.body, 'div');
    taObj.div = div;
    div.style.margin = '8px';

    var ta = O.ce(div, 'textarea');
    taObj.ta = ta;
    ta.style.width = `${this.grid.iw * .75}px`;
    ta.style.height = `${this.grid.ih * .75}px`;

    window.addEventListener('keydown', evt => {
      if(this.isCanvasVisible || evt.disabled)
        return;

      switch(evt.code){
        case 'Escape':
          this.hideTextArea(evt);
          break;
      }
    });

    this.hideTextArea();
  }

  showTextArea(evt = null){
    var {div, ta} = this.taObj;

    this.isCanvasVisible = false;
    if(evt !== null) evt.disabled = true;

    this.canvas.style.display = 'none';
    div.style.display = 'block';
    ta.value = this.exportGrid();

    ta.focus();
    ta.scrollTop = 0;
    ta.selectionStart = 0;
    ta.selectionEnd = 0;
  }

  hideTextArea(evt = null){
    var {div, ta} = this.taObj;

    div.style.display = 'none';
    this.canvas.style.display = 'block';
    this.isCanvasVisible = true;

    if(evt !== null){
      evt.disabled = true;
      this.importGrid(ta.value);
    }
  }

  ael(type, func){
    window.addEventListener(type, evt => {
      if(!this.isCanvasVisible)
        return;

      func(evt);
    });
  }

  prevLevel(){
    if(this.level === 1) return;
    this.loadLevel(this.level - 1);
  }

  nextLevel(){
    if(this.level === this.levels) return;
    this.loadLevel(this.level + 1);
  }

  update(x, y, d, prop, prev){
    if(x === null) return;

    if(!(y in this.updates)){
      var row = this.updates[y] = createObj();
      row[-1] = 0;
    }

    var row = this.updates[y];

    if(!(x in row)){
      this.updated++;
      row[-1]++;
      row[x] = d;
      d[~prop] = prev;
    }else if(d[prop] === d[~prop]){
      delete row[x];
      if(!--row[-1]){
        delete this.updates[y];
        this.updated--;
      }
    }
  }

  get(x, y){
    var d = this.grid.get(x, y);
    if(d === null) return d;
    return d.d;
  }

  tube(x, y, dir){
    var {g} = this;

    g.beginPath();
    g.moveTo(x + .25, y + .25);

    if(dir & 1){
      g.lineTo(x + .25, y);
      g.lineTo(x + .75, y);
    }
    g.lineTo(x + .75, y + .25);

    if(dir & 8){
      g.lineTo(x + 1, y + .25);
      g.lineTo(x + 1, y + .75);
    }
    g.lineTo(x + .75, y + .75);

    if(dir & 4){
      g.lineTo(x + .75, y + 1);
      g.lineTo(x + .25, y + 1);
    }
    g.lineTo(x + .25, y + .75);

    if(dir & 2){
      g.lineTo(x, y + .75);
      g.lineTo(x, y + .25);
    }

    g.closePath();
    g.fill();
    g.stroke();
  }

  iterate(func){
    this.grid.iterate((x, y, d, g) => {
      func(x, y, d.d, g);
    });
  }

  shape(x, y, func){
    var {grid} = this;

    var id = this.getId();
    var d = grid.get(x, y);
    var queue = [x, y, d];
    var arr = [[x, y, d.d]];

    if(!func(x, y, d.d)) return [];
    d.id = id;

    while(queue.length){
      var x = queue.shift();
      var y = queue.shift();
      var d = queue.shift();

      for(var dir = 0; dir < 4; dir++){
        var x1 = x + (dir === 1 ? -1 : dir === 3 ? 1 : 0);
        var y1 = y + (dir === 0 ? -1 : dir === 2 ? 1 : 0);
        var d1 = grid.get(x1, y1);

        if(d1 !== null && d1.id !== id && func(x1, y1, d1.d)){
          d1.id = id;
          queue.push(x1, y1, d1);
          arr.push([x1, y1, d1.d]);
        }
      }
    }

    return arr;
  }

  randTile(func){
    var arr = [];
    this.grid.iterate((x, y, d) => {
      if(func(x, y, d.d))
        arr.push([x, y, d.d]);
    });
    if(arr.length === 0) return [null, null, null];
    return arr[this.rand(arr.length)];
  }

  randElem(arr){
    return arr[this.rand(arr.length)];
  }

  rand(val){
    return this.random() * val | 0;
  }

  random(){
    if(!PSEUDO_RANDOM)
      return Math.random();

    var str = `${this.randSeed}_${this.randParam}`;
    var hash = this.randParam = O.sha256(str);
    var int = hash[0] * 2 ** 24 + hash[1] * 2 ** 16 + hash[2] * 2 ** 8 + hash[3];
    var double = int / 2 ** 32;

    return double;
  }

  seed(...args){
    if(!PSEUDO_RANDOM || this.randSeed === null) return;
    this.randParam = O.sha256(`${this.randSeed}_${args}_${this.randParam}`);
  }

  getId(){
    var obj = createObj();
    obj[Symbol.toPrimitive] = toPrimitive;
    return obj;
  }
};

function createIntArr(game, x = null, y = null){
  var obj = createObj();
  var ids = createObj();

  var proxy = new Proxy(createObj(), {
    get(t, prop){
      if(prop === Symbol.toPrimitive) return obj[prop];
      if(prop.toString().startsWith('id')) return ids[prop];
      return obj[prop] | 0;
    },

    set(t, prop, val){
      if(prop.toString().startsWith('id')){
        ids[prop] = val;
      }else{
        val |= 0;
        if(val === 0 && !(prop in obj)) return 1;
        if(obj[prop] === val) return 1;
        var prev = obj[prop] | 0;
        obj[prop] = val;
        game.update(x, y, obj, prop, prev);
      }
      return 1;
    }
  });

  return proxy;
}

function createObj(){
  var obj = Object.create(null);
  obj[Symbol.toPrimitive] = toPrimitive.bind(obj);
  return obj;
}

function toPrimitive(){
  var str = '{';
  for(var prop in this){
    if((prop |= 0) < 0) continue;
    if(str.length !== 1) str += ',';
    str += `${prop}:${this[prop]}`;
  }
  return str + '}';
}

function getBs(buff){
  if(typeof buff === 'string')
    buff = str2buff(buff);

  if(buff.length === 0) return null;
  var bs = new O.BitStream(buff, true);
  if(bs.error) return null;

  return bs;
}

function str2buff(str){
  var buff = str.match(/[0-9A-F]{2}/g) || [];
  buff = buff.map(a => parseInt(a, 16) & 255);
  return buff;
}