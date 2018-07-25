'use strict';

const CLEAR_CONSOLE = 0;

const OFFSET = 10;
const MAX_STR_LEN = 50;

const SCROLL_DELTA = 100;
const SCROLL_SPEED = 1;
const SCROLL_FACTOR = .1;

const PLOT_SCALE = .9;

const baseUrl = 'http://localhost/projects/test/data';

const offsets = {
  heading: 25,
  text: 0,
  btn: 0,
};

const fonts = {
  heading: 32,
  text: 20,
  btn: 24,
};

const cols = {
  bg: ['#87ceeb', '#effff0'],

  error: '#800000',

  heading: '#000000',
  text: '#000000',

  btn: '#00ff00',
  btnSelected: '#ff8000',

  plot: {
    bg: '#ffffff',
    fg: '#00ff00',
  },
};

const ls = localStorage;

var display = null;
var encryptor = null;
var password = null;

window.setTimeout(main);

async function main(){
  aels();

  display = new Display();
  var D = display;

  var attempted = 0;

  while(1){
    password = await getPassword(attempted);
    encryptor = new Encryptor(password);

    var script = await get('main.js');

    if(script === null){
      attempted = 1;
      continue;
    }

    try{
      var func = new Function('O', 'D', 'get', script);
    }catch(err){
      attempted = 1;
      continue;
    }

    break;
  }

  ls.pass = password;

  D.reset();
  func(O, display, get);
}

function aels(){
  O.ael('contextmenu', evt => {
    pd(evt);
  });

  O.ael('keydown', evt => {
    if(evt.ctrlKey){
      pd(evt);
      return;
    }

    var code = evt.code;

    if(code === 'F5'){
      O.body.innerHTML = '';
      location.reload();
      return;
    }

    if(/^F\d+$/.test(code)){
      pd(evt);
      return;
    }
  });

  function pd(evt){
    evt.preventDefault();
    evt.stopPropagation();
  }
}

function get(filePath, isBinary){
  filePath = filePath.split(/[\/\\]/).map((name, index, arr) => {
    if(index !== arr.length - 1)
      return encrypt(name);

    var [fileName, ext] = name.match(/^[^\.]+|.+/g);
    fileName = encrypt(fileName);

    return `${fileName}${ext}`;
  }).join('/');

  var url = `${baseUrl}/${filePath}`;

  return new Promise(res => {
    O.rf(url, (status, data) => {
      if(status !== 200){
        if(CLEAR_CONSOLE) console.clear();
        return res(null);
      }

      res(decrypt(data, isBinary));
    });
  });
}

function encrypt(data){
  if(data.length === 0)
    return '';

  var buff = encryptor.encrypt(data);
  var str = buff.toString('hex');

  str = str.match(/.{32}|.+/g).join('\n');

  return str;
}

function decrypt(data, isBinary=false){
  var data = encryptor.decrypt(O.Buffer.from(data, 'hex'));

  if(!isBinary)
    data = data.toString();

  return data;
}

class Display{
  constructor(){
    var {w, h, g: gBg} = O.ceCanvas(1);
    var {w, h, g} = O.ceCanvas(1);

    this.w = w;
    this.h = h;

    this.canvasBg = gBg.canvas;
    this.gBg = gBg;

    this.canvas = g.canvas;
    this.g = g;

    this.cx = -1;
    this.cy = -1;

    this.scrollY = 0;
    this.scrollYTarget = 0;

    this.elems = [];
    this.anims = [];

    this.initCtx();
    this.initBg();

    this.reset();

    this.boundRender = this.render.bind(this);
    this.render();

    this.aels();
  }

  initCtx(){
    var {g} = this;

    this.align(0);
  }

  initBg(){
    var {w, h, gBg} = this;
    var bgGradient = this.createBgGradient(cols.bg);

    gBg.fillStyle = bgGradient;
    gBg.fillRect(0, 0, w, h);
  }

  createBgGradient(cols){
    var {w, h, g} = this;

    var len = cols.length;
    var len1 = len - 1;

    var gradient = g.createLinearGradient(0, 0, 0, h);

    cols.forEach((col, index) => {
      gradient.addColorStop(index / len1, col);
    });

    return gradient;
  }

  reset(){
    this.scrollY = 0;
    this.scrollYTarget = 0;

    this.elems.length = 0;
    this.anims.length = 0;

    this.draw();
  }

  aels(){
    var {elems} = this;

    O.ael('keydown', evt => {
      switch(evt.code){
        case 'Home': this.scrollYTarget = 0; break;
      }
    });

    O.ael('mousemove', evt => {
      if(this.checkElems(evt))
        this.draw();
    });

    O.ael('click', evt => {
      this.checkElems(evt);

      var elem = elems.find(elem => elem.selected);

      if(elem)
        elem.onClick();
    });

    O.ael('wheel', evt => {
      this.scrollYTarget += Math.sign(evt.deltaY) * SCROLL_DELTA;

      if(this.scrollYTarget < 0)
        this.scrollYTarget = 0;
    });
  }

  checkElems(evt=null){
    if(evt !== null){
      this.cx = evt.clientX;
      this.cy = evt.clientY;
    }

    var {cx, cy} = this;
    var found = 0;

    this.elems.forEach(elem => {
      if(elem.onMouseMove(cx, cy))
        found = 1;
    });

    return found;
  }

  draw(){
    var {w, h, g, elems} = this;
    var len = elems.length;

    g.clearRect(0, 0, w, h);

    this.checkElems();

    var yMin = -OFFSET;
    var yMax = h + OFFSET;

    var x = OFFSET;
    var y = -this.scrollY;

    for(var i = 0; i !== len; i++){
      var elem = elems[i];
      y += elem.ofs1();

      var yNext = y + elem.height() + elem.ofs2();

      if(yNext >= yMin){
        if(y <= yMax) elem.draw(x, y, g);
        else break;
      }

      y = yNext;
    }
  }

  render(){
    var {w, h, g, anims} = this;

    var sc1 = this.scrollY;
    var sc2 = this.scrollYTarget;

    if(sc1 !== sc2){
      var dsc = sc2 - sc1;
      var sign = Math.sign(dsc);
      var abs = Math.abs(dsc);
      var diff = abs * SCROLL_FACTOR;

      if(diff < SCROLL_SPEED) diff = SCROLL_SPEED;
      if(diff > abs) diff = abs;

      this.scrollY += sign * diff;

      if(Math.abs(sc2 - this.scrollY) < SCROLL_SPEED)
        this.scrollY = sc2;

      this.draw();
    }

    if(anims.length !== 0){
      anims.forEach(anim => {
        anim(w, h, g);
      });

      this.draw();
    }

    O.raf(this.boundRender);
  }

  align(type){
    var {g} = this;

    switch(type){
      case 0:
        g.textBaseline = 'top';
        g.textAlign = 'left';
        break;

      case 1:
        g.textBaseline = 'middle';
        g.textAlign = 'center';
        break;
    }
  }

  addElem(ctor, args){
    var elem = new ctor(this, ...args);

    this.elems.push(elem);
    this.draw();

    return elem;
  }

  addHeading(...args){ return this.addElem(Heading, args); }
  addTitle(...args){ return this.addElem(Heading, args); }
  addText(...args){ return this.addElem(Text, args); }
  addBtn(...args){ return this.addElem(Button, args); }
  addPlot(...args){ return this.addElem(Plot, args); }

  removeElem(index){
    var {elems} = this;

    if(index instanceof Elem) index = elems.indexOf(index);
    if(index === -1) return;

    this.elems.splice(index, 1);
  }

  addAnim(anim){
    this.anims.push(anim);
  }

  emoveAnim(anim){
    var {anims} = this;
    var index = anims.indexOf(anim);

    if(index === -1) return;
    anims.splice(index, 1);
  }
};

class Elem{
  constructor(D){
    this.D = D;

    this.x = null;
    this.y = null;

    this.selected = 0;
  }

  draw(x, y, g){
    this.x = x;
    this.y = y;
  }

  onMouseMove(cx, cy){
    if(this.x === null) return;

    var {D} = this;

    var x1 = this.x;
    var y1 = this.y;
    var x2 = x1 + this.width();
    var y2 = y1 + this.height();

    var selected = cx >= x1 && cy >= y1 && cx < x2 && cy < y2;
    var action = 0;

    if(selected !== this.selected){
      if(selected) action = this.onMouseEnter();
      else action = this.onMouseLeave();
    }

    this.selected = selected;

    return action;
  }

  onMouseEnter(evt){ return false; }
  onMouseLeave(evt){ return false; }
  onClick(evt){}

  width(){ return 0; }
  height(){ return 0; }
  ofs1(){ return OFFSET; }
  ofs2(){ return 0; }
};

class TextElem extends Elem{
  constructor(D, val, col){
    super(D);

    this.val = val;
    this.col = col;
  }

  set(val, draw=0){
    this.val = val;
    if(draw) this.D.draw();
  }

  setCol(col, draw=0){
    this.col = col;
    if(draw) this.D.draw();
  }
};

class Heading extends TextElem{
  constructor(D, val, col=cols.heading){
    super(D, val, col);
  }

  draw(x, y, g){
    super.draw(x, y, g);

    this.D.align(0);
    g.font(fonts.heading);
    g.fillStyle = this.col;
    g.fillText(this.val, OFFSET, y);
  }

  height(){ return fonts.heading; }
  ofs2(){ return offsets.heading; }
};

class Text extends TextElem{
  constructor(D, val, col=cols.text){
    super(D, val, col);
  }

  draw(x, y, g){
    super.draw(x, y, g);

    this.D.align(0);
    g.font(fonts.text);
    g.fillStyle = this.col;
    g.fillText(this.val, x, y);
  }

  height(){ return fonts.text; }
  ofs2(){ return offsets.text; }
};

class Button extends TextElem{
  constructor(D, val, onClick=O.nop, col=cols.btn, colSelected=cols.btnSelected){
    super(D, val, col);

    this.colSelected = colSelected;
    this.onClick = onClick;
  }

  draw(x, y, g){
    super.draw(x, y, g);

    var w = this.width();
    var h = this.height();

    var hh = h / 2;
    var whh = w - hh;

    var gg = g;
    g = gg.g;

    g.translate(x + .5, y + .5);

    g.fillStyle = this.selected ? this.colSelected : this.col;
    g.beginPath();

    g.arc(hh, hh, hh, O.pih, O.pi32);
    g.lineTo(whh, 0);
    g.arc(whh, hh, hh, O.pi32, O.pih);
    g.lineTo(hh, h);

    g.fill();
    g.stroke();

    g = gg;

    this.D.align(1);
    g.font(fonts.btn);
    g.fillStyle = cols.text;
    g.fillText(this.val, w / 2, h / 2);

    g.resetTransform();
  }

  onMouseEnter(evt){ return 1; }
  onMouseLeave(evt){ return 1; }

  width(){ return 300; }
  height(){ return 35; }

  ofs1(){ return 10; }
  ofs2(){ return 10; }
};

class Plot extends Elem{
  constructor(D, w, h, maxS=null, bgCol=cols.plot.bg, fgCol=cols.plot.fg){
    super(D);

    this.w = w;
    this.h = h;

    this.maxS = maxS;

    this.bgCol = bgCol;
    this.fgCol = fgCol;

    this.arr = [];
    this.max = 0;

    this.scale = 1;
    this.index = 0;
    this.sum = 0;
  }

  draw(x, y, g){
    super.draw(x, y, g);

    var {w, h, arr, max, maxS, index} = this;

    var len = arr.length
    var len1 = len - 1;
    var len2 = len1 + index / this.scale;

    if(maxS === null)
      maxS = max / PLOT_SCALE;

    g.fillStyle = this.bgCol;
    g.beginPath();
    g.rect(x, y, w, h);
    g.fill();
    g.stroke();

    if(len >= 2){
      g = g.g;

      g.translate(x + .5, y + .5);

      g.fillStyle = this.fgCol;
      g.beginPath();

      g.moveTo(w, h);
      g.lineTo(0, h);

      arr.forEach((num, index) => {
        var x = index / len2;
        var y = 1 - num / maxS;

        g.lineTo(x * w, y * h);
      });

      if(index === 0){
        g.lineTo(w, (1 - arr[len1] / maxS) * h);
      }else{
        var s = 1 - this.sum / index / maxS;
        if(s < 0) s = 0;
        g.lineTo(w, s * h);
      }

      g.closePath();
      g.fill();
      g.stroke();

      g.resetTransform();
    }
  }

  add(num, draw=0){
    var {w, arr} = this;

    this.sum += num;

    if(++this.index === this.scale){
      num = this.sum / this.scale;

      this.index = 0;
      this.sum = 0;

      if(num > this.max) this.max = num;
      arr.push(num);

      if(arr.length === (w << 1)){
        for(var i = 0, j = 0; i !== w; i++, j += 2)
          arr[i] = (arr[j] + arr[j + 1]) / 2;

        arr.length = w;
        this.scale <<= 1;
      }
    }

    if(draw) this.D.draw();
  }

  width(){ return this.w; }
  height(){ return this.h; }
};

class Encryptor{
  constructor(password){
    this.password = O.Buffer.from(password);
    this.seed = calcHash(this.password);
  }

  encrypt(data){
    var {password} = this;

    var buff = O.Buffer.from(data);
    var mask = this.seed;

    buff = buff.map((byte, index) => {
      byte ^= mask[index & 31];

      if((index + 1 & 31) === 0)
        mask = calcHash(O.Buffer.concat([password, mask]));

      return byte;
    });

    return buff;
  }

  decrypt(data){
    return this.encrypt(data);
  }
};

function calcHash(buff){
  return O.sha256(buff);
}

async function getPassword(attempted=0){
  var D = display;

  D.reset();

  hasPass: if('pass' in ls){
    if(attempted){
      attempted = 0;
      delete ls.pass;
      break hasPass;
    }

    return ls.pass;
  }

  D.addTitle('Enter password:');

  D.addText(getChar());
  D.addText('');

  if(attempted) D.addText('Wrong password. Try again.', cols.error);
  else D.addText('');

  var es = D.elems;

  D.addAnim((w, h, g) => {
    updateText();
  });

  return await new Promise(res => {
    O.ael('keydown', onKeyDown);
    O.ael('keypress', onKeyPress);

    async function onKeyDown(evt){
      switch(evt.code){
        case 'Enter':
          O.rel('keydown', onKeyDown);
          O.rel('keypress', onKeyPress);

          var t = getText();
          res(t);
          break;

        case 'Backspace':
          var t = getText();
          t = t.substring(0, t.length - 1);
          setText(t);
          break;
      }
    }

    async function onKeyPress(evt){
      var key = evt.key;
      if(key.length !== 1) return;

      var t = getText();

      if(t.length === MAX_STR_LEN)
        return;

      t = `${t}${evt.key}`;
      setText(t);
    }
  });

  function getText(){
    var t = es[1].val;
    return t.substring(0, t.length - 1);
  }

  function setText(text){
    es[1].set(`${text}${getChar()}`);
  }

  function updateText(){
    setText(getText());
  }

  function getChar(){
    var chars = '_ ';
    var index = Date.now() / 500 & 1;

    return chars[index];
  }
}