'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Vector = require('./vector');
const vsSrc = require('./shaders/vs');
const fsSrc = require('./shaders/fs');

const lightDir = new Vector(0, -100, 50).norm();

class RenderEngine{
  constructor(canvas){
    const w = canvas.width;
    const h = canvas.height;
    const [wh, hh] = [w, h].map(a => a / 2);

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      preserveDrawingBuffer: true,
    });

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    const attribs = {};
    const uniforms = {};

    const pi = Math.PI;
    const pi2 = pi * 2;
    const pih = pi / 2;

    const aspectRatio = w / h;
    const fov = pi / 3;
    const fovt = Math.tan(fov / 2);
    const [near, far] = [1e-3, 1e3];
    const cursorSpeed = 3;

    let [tx, ty, tz] = [1.24, -4.5, 1.85];
    let [rx, ry] = [0.479, 2.447];
    
    let speed = .1;
    let dir = 0;

    let cursorLocked = 0;

    const {sqrt, sin, cos} = Math;

    const identityMat = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
    const camRot = identityMat.slice();
    const objRotMat = identityMat.slice();

    O.enhancedRNG = 0;
    const grid = new Grid();

    setTimeout(main);

    async function main(){
      initCanvas(vsSrc, fsSrc);
      await Material.init(gl);
      Model.init(gl, attribs);

      initGrid();
      Object.start();
      render();
      aels();
    }

    function aels(){
      O.ael('mousedown', evt => {
        switch(evt.button){
          case 1:
            O.pd(evt);
            if(cursorLocked) O.doc.exitPointerLock();
            else canvas.requestPointerLock();
            break;
        }
      });

      O.ael('mousemove', evt => {
        if(!cursorLocked) return;

        rx = Math.max(Math.min(rx + evt.movementY * cursorSpeed / h, pih), -pih);
        ry = (ry + evt.movementX * cursorSpeed / w) % pi2;
      });

      O.ael('keydown', evt => {
        if(!cursorLocked) return;

        switch(evt.code){
          case 'KeyW': dir |= 1; break;
          case 'KeyS': dir |= 2; break;
          case 'KeyA': dir |= 4; break;
          case 'KeyD': dir |= 8; break;
          case 'Space': dir |= 16; break;
          case 'ShiftLeft': case 'ShiftRight': dir |= 32; break;
        }
      });

      O.ael('keyup', evt => {
        if(!cursorLocked) return;

        switch(evt.code){
          case 'KeyW': dir &= ~1; break;
          case 'KeyS': dir &= ~2; break;
          case 'KeyA': dir &= ~4; break;
          case 'KeyD': dir &= ~8; break;
          case 'Space': dir &= ~16; break;
          case 'ShiftLeft': case 'ShiftRight': dir &= ~32; break;
        }
      });

      O.ael(O.doc, 'pointerlockchange', evt => {
        cursorLocked ^= 1;

        if(!cursorLocked){
          dir = 0;
        }
      });
    }

    function initCanvas(vs, fs){
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);

      const col = 169 / 255;
      gl.viewport(0, 0, w, h);
      gl.clearColor(col, col, col, 1.);

      const vShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vShader, vs);
      gl.compileShader(vShader);
      if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)){
        console.error(`[${'VERTEX'}] ${gl.getShaderInfoLog(vShader)}`);
        return;
      }

      const fShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fShader, fs);
      gl.compileShader(fShader);
      if(!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)){
        console.error(`[${'FRAGMENT'}] ${gl.getShaderInfoLog(fShader)}`);
        return;
      }

      const program = gl.createProgram();
      gl.attachShader(program, vShader);
      gl.attachShader(program, fShader);
      gl.linkProgram(program);
      gl.useProgram(program);

      gl.enableVertexAttribArray(attribs.v1 = gl.getAttribLocation(program, 'v1'));
      gl.enableVertexAttribArray(attribs.v2 = gl.getAttribLocation(program, 'v2'));
      gl.enableVertexAttribArray(attribs.n1 = gl.getAttribLocation(program, 'n1'));
      gl.enableVertexAttribArray(attribs.n2 = gl.getAttribLocation(program, 'n2'));
      gl.enableVertexAttribArray(attribs.tex = gl.getAttribLocation(program, 'tex'));

      uniforms.camTrans = gl.getUniformLocation(program, 'camTrans');
      uniforms.camRot = gl.getUniformLocation(program, 'camRot');
      uniforms.objRotation = gl.getUniformLocation(program, 'objRotation');
      uniforms.projection = gl.getUniformLocation(program, 'projection');
      uniforms.scale = gl.getUniformLocation(program, 'scale');
      uniforms.k = gl.getUniformLocation(program, 'k');
      uniforms.lightDir = gl.getUniformLocation(program, 'lightDir');
      uniforms.calcLight = gl.getUniformLocation(program, 'calcLight');

      gl.uniform3f(uniforms.lightDir, lightDir.x, lightDir.y, lightDir.z);

      gl.uniformMatrix4fv(uniforms.projection, false, new Float32Array([
        1 / (aspectRatio * fovt), 0, 0, 0,
        0, 1 / fovt, 0, 0,
        0, 0, -(far + near) / (far - near), -1,
        0, 0, -2 * far * near / (far - near), 0,
      ]));
    }

    function initGrid(){
      const n = 20;
      O.repeat(2, y => {
        O.repeat(n, z => O.repeat(n, x => {
          const d = grid.get(x, y, z);

          if(!y) return new Object.Dirt(d);
          if((x || z) && O.rand(40) === 0) new Object.Stone(d);
          else if(O.rand(20) === 0) new Object.Man(d);
        }));
      });
    }

    function render(){
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      if(dir){
        const sp = speed;
        let x, y, z;

        if(dir & 3){
          x = sp * -sin(ry);
          z = sp * cos(ry);

          if(dir & 1) tx += x, tz += z;
          if(dir & 2) tx -= x, tz -= z;
        }

        if(dir & 12){
          x = sp * -sin(ry);
          z = sp * cos(ry);

          if(dir & 4) tx += z, tz -= x;
          if(dir & 8) tx -= z, tz += x;
        }

        if(dir & 16) ty -= sp;
        if(dir & 32) ty += sp;
      }

      const sx = sin(rx), cx = cos(rx);
      const sy = sin(ry), cy = cos(ry);

      camRot[0] = cy;
      camRot[1] = sx * sy;
      camRot[2] = -cx * sy;
      camRot[5] = cx;
      camRot[6] = sx;
      camRot[8] = sy;
      camRot[9] = -sx * cy;
      camRot[10] = cx * cy;

      gl.uniformMatrix4fv(uniforms.camRot, false, camRot);

      // Render sky
      const sky = Model.sky[0];
      sky.buffer();
      gl.uniform3f(uniforms.camTrans, 0, 0, 0);
      objRotMat[0] = objRotMat[10] = 1;
      objRotMat[2] = objRotMat[8] = 0;
      gl.uniformMatrix4fv(uniforms.objRotation, false, objRotMat);
      gl.uniform1f(uniforms.scale, 1e3);
      gl.uniform1i(uniforms.calcLight, 0);
      gl.bindTexture(gl.TEXTURE_2D, Material.sky.tex);
      gl.drawElements(gl.TRIANGLES, sky.len, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(uniforms.calcLight, 1);

      let rot = null;

      const t = Date.now();
      const k = (t - Object.lastTick) / Object.TICK_TIME;

      for(const [models, set] of Shape.shapes){
        const modelsNum = models.length;
        const modelsNum1 = modelsNum - 1;
        const mul = k * modelsNum1;

        const model1Index = Math.min(mul | 0, modelsNum1);
        const model2Index = Math.min(model1Index + 1, modelsNum1);
        const model1 = models[model1Index];
        const model2 = models[model2Index];

        gl.uniform1f(uniforms.k, mul % 1);

        Model.buffer(model1, model2);

        for(const shape of set){
          const {obj} = shape;
          if(obj === null) continue;

          gl.uniform3f(uniforms.camTrans, tx + obj.getX(t), ty + obj.getY(t), tz + obj.getZ(t));
          gl.uniform1f(uniforms.scale, shape.scale);
          gl.bindTexture(gl.TEXTURE_2D, shape.mat.tex);

          const r = obj.getRot(t);
          if(r !== rot){
            rot = r;
            objRotMat[0] = objRotMat[10] = cos(r);
            objRotMat[2] = -(objRotMat[8] = sin(r));
            gl.uniformMatrix4fv(uniforms.objRotation, false, objRotMat);
          }

          gl.drawElements(gl.TRIANGLES, model1.len, gl.UNSIGNED_SHORT, 0);
        }
      }

      O.raf(render);
    }
  }
};

module.exports = RenderEngine;