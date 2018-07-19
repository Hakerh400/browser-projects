'use strict';

const OFFSET = 5;
const TITLE_OFFSET = 25;
const MAX_STR_LEN = 50;

const baseUrl = 'http://localhost/projects/test/data';

const offsets = {
  heading: 25,
  text: 0,
  btn: 0,
};

const fonts = {
  heading: 32,
  text: 20,
};

const cols = {
  bg: 'darkgray',
  error: '#800000',

  heading: 'black',
  text: 'black',
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
      res(decrypt(data, isBinary));
    });
  });
}

function encrypt(data){
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
    var {w, h, g} = O.ceCanvas(1);

    this.w = w;
    this.h = h;

    this.canvas = g.canvas;
    this.g = g;

    this.elems = [];
    this.anims = [];

    this.initCtx();
    this.reset();

    this.boundRender = this.render.bind(this);
    this.render();
  }

  initCtx(){
    var {g} = this;

    g.textBaseline = 'top';
    g.textAlign = 'left';
  }

  reset(){
    this.elems.length = 0;
    this.anims.length = 0;

    this.draw();
  }

  draw(){
    var {w, h, g, elems} = this;

    g.fillStyle = cols.bg;
    g.fillRect(0, 0, w, h);

    var x = OFFSET;
    var y = 0;

    elems.forEach(elem => {
      y += elem.ofs1();
      elem.draw(x, y, g);
      y += elem.height() + elem.ofs2();
    });
  }

  render(){
    var {w, h, g, anims} = this;

    if(anims.length !== 0){
      anims.forEach(anim => {
        anim(w, h, g);
      });

      this.draw();
    }

    O.raf(this.boundRender);
  }

  addHeading(val, col){
    this.elems.push(new Heading(this, val, col));
    this.draw();
  }

  addTitle(val, col){
    this.addHeading(val, col);
  }

  addText(val, col){
    this.elems.push(new Text(this, val, col));
    this.draw();
  }

  remove(index){
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
  }

  draw(x, y, g){}

  ofs1(){ return OFFSET; }
  height(){ return 0; }
  ofs2(){ return 0; }
};

class TextElem extends Elem{
  constructor(D, val, col){
    super(D);

    this.val = val;
    this.col = col;
  }

  set(val){
    this.val = val;
    this.D.draw();
  }

  setCol(col){
    this.col = col;
    this.D.draw();
  }
};

class Heading extends TextElem{
  constructor(D, val, col=cols.heading){
    super(D, val, col);
  }

  draw(x, y, g){
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
    g.font(fonts.text);
    g.fillStyle = this.col;
    g.fillText(this.val, x, y);
  }

  height(){ return fonts.text; }
  ofs2(){ return offsets.text; }
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