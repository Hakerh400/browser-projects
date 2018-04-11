'use strict';

const IP = '127.0.0.1';
const PORT = 1037;

var {w, h, g} = O.ceCanvas();
var [wh, hh] = [w, h].map(a => a >> 1);
var [cx, cy] = [wh, hh];

var ws = null;

setTimeout(main);

function main(){
  addEventListeners();
  createSocket();
}

function addEventListeners(){
  ael('mousemove', evt => {
    cx = evt.clientX;
    cy = evt.clientY;
  });
}

function onOpen(){
  var nick = 'test';
  var arr = new Uint8Array(nick.length + 2);
  arr[0] = 0;
  arr[1] = nick.length;
  [...nick].forEach((a, b) => arr[b + 2] = a.charCodeAt(0));
  ws.send(arr);

  setTimeout(tick);
}

function onMsg(evt){
  var data = new Uint8Array(evt.data);
  console.log([...data].map(a => String.fromCharCode(a)).join``);
}

function onClose(){
  ws = null;
  console.log('CLOSED');
}

function onError(){
  throw new Error();
}

function createSocket(){
  ws = new WebSocket(`ws://${IP}:${PORT}`);
  ws.binaryType = 'arraybuffer';

  ws.onopen = onOpen;
  ws.onmessage = onMsg;
  ws.onclose = onClose;
  ws.onerror = onError;

  return ws;
}

function tick(){
  if(ws === null)
    return;

  var angle = Math.atan2(hh - cy, wh - cx);
  var buff = new ArrayBuffer(5);
  var view = new DataView(buff);
  view.setUint8(0, 1);
  view.setFloat32(1, angle, 1);
  ws.send(buff);

  requestAnimationFrame(tick);
}

function ael(type, func){
  window.addEventListener(type, evt => {
    func(evt);
  });
}