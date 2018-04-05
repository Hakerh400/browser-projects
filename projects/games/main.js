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
    var games = O.sanl(data);

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
    this.loadLevel();
  }

  addEventListeners(){
    this.ael('keydown', evt => {
      switch(evt.code){
        case 'Escape':
          this.showTextArea(evt);
          break;

        default:
          if(!(evt.code in this.kb)) break;
          this.kb[evt.code]();
          break;
      }
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

  loadLevel(){
    var level = O.urlParam('level');
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

      if(bs !== null)
        this.import(x, y, d, bs);
      else{
        if(x === 0 && y === 0){
          d[0] = 1;
        }else{
          if(O.rand(10) === 0){
            d[3] = 1;
          }else{
            d[1] = O.rand(10) === 0;
            d[2] = O.rand(10) === 0;
          }
        }
      }

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

    return bs.stringify(true);
  }

  importGrid(str){
    if(!this.v){
      this.resetGrid(10, 10);
      this.v = 1;
    }else{
      var bs = getBs(str);
      if(bs === null)
        return O.error('Unrecognized level format.');

      var w = 1 + bs.read(MAX_DIM1);
      var h = 1 + bs.read(MAX_DIM1);

      this.resetGrid(w, h, bs);
    }

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
    this.importGrid(ta.value);
    this.isCanvasVisible = true;

    if(evt !== null)
      evt.disabled = true;
  }

  ael(type, func){
    window.addEventListener(type, evt => {
      if(!this.isCanvasVisible)
        return;

      func(evt);
    });
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