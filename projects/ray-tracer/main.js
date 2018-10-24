'use strict';

const Vector = require('./vector');
const Ray = require('./ray');
const Camera = require('./camera');

const SCALE = .2;
const VIEW_DISTANCE = 100;
const TARGET_FPS = 55;
const CAM_SPEED = .5;

const targetDt = 1e3 / TARGET_FPS;

const w = Math.round(window.innerWidth * SCALE);
const h = Math.round(window.innerHeight * SCALE);

const [wh, hh] = [w, h].map(a => a / 2);

const pixelsNum = w * h;
var pixelsPerFrame = 1e3;

const g = createContext();
const imgd = g.createImageData(w, h);
const {data} = imgd;

const pixels = [];
var pixelIndex = 0;

const cam = new Camera(5, -10, -22, 0, 0, 0, 0, 0);
const {vel} = cam;

const text = createText(O.projectToName(O.project));

var time = Date.now();

window.setTimeout(main);

function main(){
  O.body.classList.add('has-canvas');
  O.body.style.backgroundColor = '#000000';
  O.body.style.overflow = 'hidden';

  for(var i = 3; i < data.length; i += 4)
    data[i] = 255;

  for(var i = 0, y = 0; y !== h; y++){
    for(var x = 0; x !== w; x++, i += 4){
      pixels.push([(x - wh) / wh, (y - hh) / wh, i]);
    }
  }

  O.shuffle(pixels);

  aels();
  render();
}

function aels(){
  O.ael('mousedown', evt => {
    if(!isCurLocked())
      g.canvas.requestPointerLock();
  });

  O.ael('mousemove', evt => {
    if(!isCurLocked()) return;

    const dx = evt.movementX / 100;
    const dy = -evt.movementY / 100;

    cam.pitch = O.bound(cam.pitch + dy, -O.pih, O.pih);
    cam.yaw = (cam.yaw + dx) % O.pi2;
  });

  O.ael('keydown', evt => {
    switch(evt.code){
      case 'KeyW': vel.z = CAM_SPEED; break;
      case 'KeyA': vel.x = -CAM_SPEED; break;
      case 'KeyS': vel.z = -CAM_SPEED; break;
      case 'KeyD': vel.x = CAM_SPEED; break;
      case 'Space': vel.y = -CAM_SPEED; break;
      case 'ShiftLeft': vel.y = CAM_SPEED; break;
    }
  });

  O.ael('keyup', evt => {
    switch(evt.code){
      case 'KeyW': vel.z = 0; break;
      case 'KeyA': vel.x = 0; break;
      case 'KeyS': vel.z = 0; break;
      case 'KeyD': vel.x = 0; break;
      case 'Space': vel.y = 0; break;
      case 'ShiftLeft': vel.y = 0; break;
    }
  });
}

function createContext(){
  const canvas = O.ce(O.body, 'canvas');

  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.width = w;
  canvas.height = h;

  return canvas.getContext('2d');
}

function createText(str){
  const canvas = O.doc.createElement('canvas');
  const g = canvas.getContext('2d');
  const size = 15;

  g.font = `${size}px Arial`;
  var w = Math.ceil(g.measureText(str).width) + 10;
  var h = size + 10;

  canvas.width = w;
  canvas.height = h;

  g.font = `${size}px Arial`;
  g.textBaseline = 'top';
  g.textAlign = 'left';

  g.fillText(str, 5, 5);
  var data = g.getImageData(0, 0, w, h).data;

  var map = new O.Map2D();

  for(var i = 0, y = 0; y !== h; y++){
    for(var x = 0; x !== w; x++, i += 4){
      if(data[i + 3] > 123 || x === 0 || y === 0 || x === w - 1 || y === h - 1)
        map.add(x, y);
    }
  }

  return map;
}

function render(t){
  if((t - time) > targetDt){
    pixelsPerFrame /= 1.1;
  }else{
    pixelsPerFrame *= 1.1;
  }

  pixelsPerFrame = Math.round(pixelsPerFrame);
  if(pixelsPerFrame > pixelsNum) pixelsPerFrame = pixelsNum;

  time = t;

  cam.tick();
  const {x: camX, y: camY, z: camZ, yaw, pitch} = cam;

  const sx = Math.sin(pitch);
  const cx = Math.cos(pitch);
  const sy = Math.sin(yaw);
  const cy = Math.cos(yaw);

  const ray = new Ray(0, 0, 0, 0, 0, 0);
  const vec = new Vector(0, 0, 0);

  for(let i = 0; i !== pixelsPerFrame; i++){
    const pixelData = pixels[pixelIndex++];
    if(pixelIndex === pixelsNum) pixelIndex = 0;

    const xx = pixelData[0];
    const yy = pixelData[1];
    const i = pixelData[2];

    vec.set_(xx, yy, 1).rotsc_(sx, cx, sy, cy, 0, 1).setLen(1);
    ray.reset(camX, camY, camZ, vec.x, vec.y, vec.z);

    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;

    for(var j = 0; j !== VIEW_DISTANCE; j++){
      ray.move();
      var {x, y, z} = ray;

      if(
        x === 10 && text.has(-z, y + 10) ||
        x === -20 || x === 20 ||
        y === -20 || y === 20 ||
        z === 10 || z === -100
      ){
        var k = 1 - j / VIEW_DISTANCE;

        if(x === 10 && text.has(-z, y + 10)){
          data[i] = 255 * k;
          data[i + 1] = 255 * k;
          data[i + 2] = 255 * k;
          break;
        }

        var col = (ray.dir > 0 ? 255 : 128) * k;
        data[i + Math.abs(ray.dir) - 1] = col;

        break;
      }
    }
  }

  g.putImageData(imgd, 0, 0);

  O.raf(render);
}

function isCurLocked(){
  return O.doc.pointerLockElement !== null;
}