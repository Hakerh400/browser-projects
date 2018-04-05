'use strict';

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

    this.init();
  }

  init(){
    this.kb = Object.create(null);
    this.mouse = Object.create(null);

    this.func(O, this);
    this.loadLevel(O.urlParam('level') || 1);
  }

  addEventListeners(){
    this.ael('keydown', evt => {
      if(evt.code === 'Escape'){
        this.showTextArea(evt);
        return;
      }

      if(evt.ctrlKey){
        if(evt.code === 'ArrowLeft') this.prevLevel();
        else if(evt.code === 'ArrowRight') this.nextLevel();
        return;
      }

      if(!(evt.code in this.kb)){
        if('_dir' in this.kb){
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

            this.kb._dir(dir, dx, dy);
          }
        }

        return;
      }

      this.kb[evt.code]();
    });
  }

  createGrid(){
    this.grid = new O.TilesGrid();
    this.g = this.grid.g;
    this.canvas = this.g.canvas;

    var {grid} = this;

    grid.setWH(1, 1);
    grid.setSize(32);
    grid.setTileParams(['d']);
    grid.setDrawFunc(this.drawFunc.bind(this));

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

  resetGrid(w, h, bs = null){
    this.w = w;
    this.h = h;

    if(this.grid === null) this.createGrid();
    if(this.taObj === null) this.createTextArea();

    var {grid} = this;
    grid.setWH(w, h);

    this.arr = createIntArr();

    grid.create((x, y) => {
      var d = createIntArr();
      this.import(x, y, d, bs);
      return [d];
    });
  }

  drawGrid(){
    this.grid.draw();
  }

  drawFunc(x, y, d, g){
    this.draw(x, y, d.d, g);
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
    /*var bs = new O.BitStream();
    var w = 11;
    var h = 11;
    bs.write(w - 1, MAX_DIM1);
    bs.write(h - 1, MAX_DIM1);

    for(var y = 0; y < w; y++){
      for(var x = 0; x < h; x++){
        var xx = Math.min(x, w - x - 1);
        var yy = Math.min(y, h - y - 1);

        if(xx + yy < 2){
          bs.write(1, 1);
        }else{
          bs.write(0, 1);
          if(x === (w >> 1) && y === (h >> 1)){
            bs.write(1, 1);
          }else{
            bs.write(0, 1);
            bs.write(x === 1 && y === 1 ? 16 : 0, 31);
          }
        }
      }
    }

    bs.pack();
    var str = bs.stringify(true);*/

    /////////////////////////////////////////////////////////////

    var bs = getBs(str);
    if(bs === null)
      return O.error('Unrecognized level format.');

    var w = 1 + bs.read(MAX_DIM1);
    var h = 1 + bs.read(MAX_DIM1);

    this.resetGrid(w, h, bs);
    this.drawGrid();
  }

  createTextArea(){
    var taObj = this.taObj = Object.create(null);

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

  update(x, y){
    var d = this.grid.get(x, y);
    this.drawFunc(x, y, d, this.g);
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

  randTile(func){
    var arr = [];
    this.grid.iterate((x, y, d) => {
      if(func(x, y, d.d))
        arr.push([x, y, d.d]);
    });
    if(arr.length === 0) return [null, null, null];
    return arr[this.rand(arr.length)];
  }

  rand(val){
    return this.random() * val | 0;
  }

  random(){
    var str = this.exportGrid();
    var int = parseInt(str.substring(0, 8), 16);
    var double = int / 2 ** 32;
    return double;
  }
};

function createIntArr(){
  var obj = Object.create(null);

  var proxy = new Proxy(obj, {
    get(obj, index){
      return obj[index] | 0;
    },

    set(obj, index, val){
      obj[index] = val | 0;
      return true;
    }
  });

  return proxy;
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