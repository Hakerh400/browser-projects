'use strict';

/*
  Constants
*/

const IP = '127.0.0.1';
const PORT = 1037;

const CHUNK_WIDTH = 30;
const CHUNK_HEIGHT = 17;

const TICKS_PER_SECOND = 30;
const TIMEOUT_DELAY = Math.round(1e3 / TICKS_PER_SECOND);

const LAYERS_NUM = 2;

const SQRT3 = Math.sqrt(3);
const EYE_RADIUS = SQRT3 / 16;
const EYE_POSITION = SQRT3 / 10;
const EYE_PUPIL_RADIUS = SQRT3 / 40;
const EYE_PUPIL_POSITION = EYE_RADIUS - EYE_PUPIL_RADIUS + .25;

/*
  Variables
*/

var tileSize = 64;

var ws = null;
var display = null;
var changes = null;

var accelerationPrev = 0;
var acceleration = 0;

var ents = [];

var w, h, wh, hh;
var tickTime;

/*
  Initialization
*/

window.setTimeout(() => init());

var init = () => {
  ents.length = 0;

  resetChanges();
  createDisplay();
  createSocket();
  aels();

  injectStylesheet();

  tickTime = Date.now();
  setTimeout(sendChanges);
  setTimeout(render);
};

/*
  General functions
*/

var resetChanges = () => {
  changes = {
    dir: null,
    inventory: null,
    lmb: null,
    rmb: null,
  };
};

var createDisplay = () => {
  O.body.classList.add('has-canvas');
  display = new Display(LAYERS_NUM);
};

var createSocket = () => {
  ws = new WebSocket(`ws://${IP}:${PORT}`);
  ws.binaryType = 'arraybuffer';

  ws.onopen = wsListeners.onOpen;
  ws.onmessage = wsListeners.onMsg;
  ws.onclose = wsListeners.onClose;
  ws.onerror = wsListeners.onError;

  return ws;
};

var isWsReady = () => {
  return ws !== null && ws.readyState === 1;
};

var createView = (type, len) => {
  var buff = new ArrayBuffer(len + 1);
  var view = new DataView(buff);
  view.setUint8(0, type);
  return view;
};

var aels = () => {
  ael('mousemove', evt => {
    var dx = evt.clientX - wh;
    var dy = evt.clientY - hh;
    var dir = Math.atan2(dy, dx);
    changes.dir = dir;
  });
};

var ael = (type, func) => {
  window.addEventListener(type, evt => {
    if(!isWsReady()) return;
    func(evt);
  });
};

var injectStylesheet = () => {
  var css = O.ce(O.head, 'link');
  css.rel = 'stylesheet';
  css.type = 'text/css';
  css.href = `/projects/${O.project}/style.css`;
};

var getEntIndexById = (id1, id2) => {
  return ents.findIndex(ent => ent.id1 === id1 && ent.id2 === id2);
};

var getEntById = (id1, id2) => {
  var index = ents.findIndex(ent => ent.id1 === id1 && ent.id2 === id2);
  if(index === -1) return null;
  return ents[index];
};

/*
  Main loop
*/

var sendChanges = () => {
  if(isWsReady()){
    if(changes.dir !== null){
      wsSend.dir(changes.dir);
      changes.dir = null;
    }

    if(acceleration !== accelerationPrev){
      wsSend.acceleration(acceleration);
      accelerationPrev = acceleration;
    }
  }

  var time = Math.max(TIMEOUT_DELAY - (Date.now() - tickTime), 0);
  setTimeout(sendChanges, time);
  tickTime = Date.now();
};

var render = () => {
  if(isWsReady() && ents.length !== 0){
    var g = display.getLayer(1).g;
    var player = ents[0];
    var {x, y} = player.coords;

    draw.grid(x, y);

    g.resetTransform();
    g.clearRect(0, 0, w, h);

    g.translate(wh - x * tileSize, hh - y * tileSize);
    g.scale(tileSize, tileSize);
    g.lineWidth = 1 / tileSize;

    for(var ent of ents){
      ent.draw(g);
    }
  }

  requestAnimationFrame(render);
};

/*
  Specific functions
*/

var wsListeners = {
  onOpen: () => {
    wsSend.nick('Test');
  },

  onMsg: evt => {
    var view = new DataView(evt.data);
    var type = view.getUint8(0);

    switch(type){
      case 0x00: /* Grid fragment */ break;
      case 0x01: /* Single tile */ break;
      case 0x02: parse.newEnt(view); break;
      case 0x03: parse.updateEnt(view); break;
      case 0x04: parse.removeEnt(view); break;
    }
  },

  onClose: () => {
    log('CLOSED');
    ws = null;
  },

  onError: () => {
    throw new Error();
  },
};

var wsSend = {
  nick: nick => {
    var view = createView(0x00, nick.length + 1);
    view.setUint8(1, nick.length);
    for(var i = 0; i < nick.length; i++)
      view.setUint8(i + 2, nick.charCodeAt(i));
    ws.send(view);
  },

  dir: dir => {
    var view = createView(0x01, 4);
    view.setFloat32(1, dir, 1);
    ws.send(view);
  },

  acceleration: acceleration => {
    var view = createView(0x02, 1);
    view.setUint8(1, acceleration);
    ws.send(view);
  },
};

var parse = {
  newEnt: view => {
    var id1 = view.getUint32(1, 1);
    var id2 = view.getUint32(5, 1);
    var x = view.getFloat64(9, 1);
    var y = view.getFloat64(17, 1);
    var dir = view.getFloat32(25, 1);
    var entType = view.getUint16(29, 1);

    var ent = new Player(id1, id2, x, y, dir, 'nick');
    ents.push(ent);
  },

  updateEnt: view => {
    var id1 = view.getUint32(1, 1);
    var id2 = view.getUint32(5, 1);
    var ent = getEntById(id1, id2);

    var type = view.getUint8(9);
    var index = 10;

    if(type & 1){
      ent.coords.x = view.getFloat64(index, 1);
      ent.coords.y = view.getFloat64(index + 8, 1);
      index += 16;
    }

    if(type & 2){
      ent.dir = view.getFloat32(index, 1);
      index += 4;
    }

    if(type & 4){
      /* Parse extra data */
    }
  },

  removeEnt: view => {
    var id1 = view.getUint32(1, 1);
    var id2 = view.getUint32(5, 1);
    var entIndex = getEntIndexById(id1, id2);

    var reason = view.getUint8(9);

    ents.splice(entIndex, 1);
  }
};

var draw = {
  grid: (x, y) => {
    var g = display.getLayer(0).g;
    g.clearRect(0, 0, w, h);

    x = x % 1 * tileSize;
    y = y % 1 * tileSize;

    g.beginPath();
    g.strokeStyle = 'darkgray';

    for(var i = -x; i < w; i += tileSize){
      g.moveTo(i, 0);
      g.lineTo(i, h);
    }

    for(var i = -y; i < h; i += tileSize){
      g.moveTo(0, i);
      g.lineTo(w, i);
    }

    g.stroke();
  },

  circ: (g, x, y, radius) => {
    g.beginPath();
    g.arc(x, y, radius, 0, O.pi2);
    g.fill();
    g.stroke();
  },
};

/*
  Classes
*/

class Display{
  constructor(layersNum = 0){
    this.layers = [];

    this.updateWH();
    this.aels();

    if(layersNum !== 0){
      O.repeat(layersNum, () => {
        this.createLayer();
      });
    }
  }

  aels(){
    ael('keydown', evt => {
      switch(evt.code){
        case 'ArrowUp': case 'KeyW': acceleration |= 1; break;
        case 'ArrowLeft': case 'KeyA': acceleration |= 2; break;
        case 'ArrowDown': case 'KeyS': acceleration |= 4; break;
        case 'ArrowRight': case 'KeyD': acceleration |= 8; break;
      }
    });

    ael('keyup', evt => {
      switch(evt.code){
        case 'ArrowUp': case 'KeyW': acceleration &= ~1; break;
        case 'ArrowLeft': case 'KeyA': acceleration &= ~2; break;
        case 'ArrowDown': case 'KeyS': acceleration &= ~4; break;
        case 'ArrowRight': case 'KeyD': acceleration &= ~8; break;
      }
    });

    window.addEventListener('resize', evt => {
      this.updateWH();
    });

    window.addEventListener('contextmenu', evt => {
      evt.preventDefault();
    });
  }

  updateWH(){
    w = window.innerWidth;
    h = window.innerHeight;
    wh = w / 2;
    hh = h / 2;

    for(var layer of this.layers)
      layer.updateWH();
  }

  createLayer(){
    var layer = new Layer(this, this.layers.length);
    this.layers.push(layer);
    return layer;
  }

  getLayer(index){
    return this.layers[index];
  }
};

class Layer{
  constructor(display, zIndex){
    this.display = display;
    this.zIndex = zIndex;

    this.createCanvas();
    this.updateWH();
  }

  updateWH(){
    this.canvas.width = w;
    this.canvas.height = h;
  }

  createCanvas(){
    var canvas = this.canvas = O.ce(O.body, 'canvas');
    canvas.classList.add('layer');
    canvas.style.zIndex = `${this.zIndex}`;
    this.g = canvas.getContext('2d');
  }
};

class Unique{
  constructor(id1, id2){
    this.id1 = id1;
    this.id2 = id2;
  }
};

class Entity extends Unique{
  constructor(id1, id2, x, y, dir){
    super(id1, id2);

    this.coords = new O.Vector(x, y);
    this.dir = dir;

    this.type = 0;
  }

  beforeDraw(g){
    var {coords} = this;

    g.save();
    g.translate(coords.x, coords.y);
    g.rotate(this.dir);
  }

  afterDraw(g){
    g.restore();
  }
};

class Player extends Entity{
  constructor(id1, id2, x, y, dir, nick){
    super(id1, id2, x, y, dir);

    this.nick = nick;
    this.type = 1;
  }

  draw(g){
    this.beforeDraw(g);

    g.fillStyle = '#ffff00';
    draw.circ(g, 0, 0, .5);

    g.fillStyle = '#ffffff';
    draw.circ(g, .25, EYE_POSITION, EYE_RADIUS);
    draw.circ(g, .25, -EYE_POSITION, EYE_RADIUS);

    g.fillStyle = '#000000';
    draw.circ(g, EYE_PUPIL_POSITION, EYE_POSITION, EYE_PUPIL_RADIUS);
    draw.circ(g, EYE_PUPIL_POSITION, -EYE_POSITION, EYE_PUPIL_RADIUS);

    this.afterDraw(g);
  }
};