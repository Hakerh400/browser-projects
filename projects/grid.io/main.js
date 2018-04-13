'use strict';

/*
  Constants
*/

const IP = '127.0.0.1';
const PORT = 1037;

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
var w, h, wh, hh;

var ents = [];

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
};

/*
  General functions
*/

var resetChanges = () => {
  changes = {
    dir: null,
    velocity: null,
    inventory: null,
    lmb: null,
    rmb: null,
  };
};

var createDisplay = () => {
  O.body.classList.add('has-canvas');

  display = new Display();
  display.createLayer();
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

/*
  Main loop
*/

var tick = () => {
  if(!isWsReady()) return;

  sendChanges();
  render();

  requestAnimationFrame(tick);
};

var sendChanges = () => {
  if(changes.dir !== null){
    wsSend.dir(changes.dir);
    changes.dir = null;
  }
};

var render = () => {
  var g = display.getLayer(0).g;
  g.resetTransform();
  g.clearRect(0, 0, w, h);

  g.translate(wh, hh);
  g.scale(tileSize, tileSize);
  g.lineWidth = 1 / tileSize;

  for(var ent of ents){
    ent.draw(g);
  }
};

/*
  Specific functions
*/

var wsListeners = {
  onOpen: () => {
    wsSend.nick('Test');

    setTimeout(tick);
  },

  onMsg: evt => {
    var view = new DataView(evt.data);
    var type = view.getUint8(0);

    var id1 = view.getUint32(1, 1);
    var id2 = view.getUint32(5, 1);
    var x = view.getFloat64(9, 1);
    var y = view.getFloat64(17, 1);
    var dir = view.getFloat32(25, 1);
    var entType = view.getUint16(29, 1);

    var ent = ents.find(ent => ent.id1 === id1 && ent.id2 === id2);

    if(!ent){
      ent = new Player(id1, id2, x, y, dir, 'nick');
      ents.push(ent);
    }else{
      ent.x = x;
      ent.y = y;
      ent.dir = dir;
    }
  },

  onClose: () => {
    console.log('CLOSED');
    ws = null;
  },

  onError: () => {
    throw new Error();
  },
};

var wsSend = {
  nick: (nick) => {
    var view = createView(0x00, nick.length + 1);
    view.setUint8(1, nick.length);
    for(var i = 0; i < nick.length; i++)
      view.setUint8(i + 2, nick.charCodeAt(i));
    ws.send(view);
  },

  dir: (dir) => {
    var view = createView(0x01, 4);
    view.setFloat32(1, dir, 1);
    ws.send(view);
  },
};

var draw = {
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
  constructor(){
    this.layers = [];

    this.updateWH();
    this.aels();
  }

  aels(){
    window.addEventListener('resize', () => {
      this.updateWH();
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
    canvas.style.zIndex = this.zIndex;
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

    this.x = x;
    this.y = y;
    this.dir = dir;

    this.type = 0;
  }

  beforeDraw(g){
    g.save();
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