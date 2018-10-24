'use strict';

const Vector = require('./vector');
const Ray = require('./ray');
const Camera = require('./camera');

const CAM_SPEED = 1;

const w = Math.round(window.innerWidth / 10);
const h = Math.round(window.innerHeight / 10);

const [wh, hh] = [w, h].map(a => a / 2);

const g = createContext();
const imgd = g.createImageData(w, h);
const {data} = imgd;

const cam = new Camera(0, 0, 0, 0, 0, 0, 0, 0, 0);
const {vel} = cam;

window.setTimeout(main);

function main(){
  O.body.classList.add('has-canvas');
  O.body.style.backgroundColor = '#000000';
  O.body.style.overflow = 'hidden';

  for(var i = 3; i < data.length; i += 4)
    data[i] = 255;

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

function render(){
  cam.tick();

  const {x: cx, y: cy, z: cz, yaw, pitch} = cam;

  const ray = new Ray(0, 0, 0, 0, 0, 0);
  const vec = new Vector(0, 0, 0);

  for(var i = 0, yy = 0; yy !== h; yy++){
    for(var xx = 0; xx !== w; xx++, i += 4){
      vec.set_((xx - wh) / wh, (yy - hh) / wh, 1).
        rot_(pitch, yaw, 0).
        setLen(1);

      ray.reset(cam.x, cam.y, cam.z, vec.x, vec.y, vec.z);

      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;

      for(var j = 0; j !== 100; j++){
        ray.move();
        var {x, y, z} = ray;

        if((x ^ y ^ z) === 0){
          data[i + Math.abs(ray.dir) - 1] = ray.dir > 0 ? 255 : 128;
          break;
        }
      }
    }
  }

  g.putImageData(imgd, 0, 0);

  O.raf(render);
}

function isCurLocked(){
  return O.doc.pointerLockElement !== null;
}