'use strict';

const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const Shape = require('./shape');
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

    const attribs = {};
    const uniforms = {};

    const vertsBuf = gl.createBuffer();
    const normsBuf = gl.createBuffer();
    const texBuf = gl.createBuffer();
    const indBuf = gl.createBuffer();

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

    main();

    // Initialize grid
    O.enhancedRNG = 0;
    const n = 20;
    const grid = new Grid();
    O.repeat(2, y => {
      O.repeat(n, z => O.repeat(n, x => {
        const d = grid.init(x, y, z);

        if(!y) return new Object.Grass(d);
        if((x || z) && O.rand(40) === 0) new Object.Stone(d);
        else if(O.rand(20) === 0) new Object.Entity(d);
      }));
    });

    // Load image
    const img = new Image();
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      render();
      Object.start();
    };
    img.src = O.urlTime(`/projects/${O.project}/1.png`);
    const texture = gl.createTexture();

    function main(){
      initCanvas(vsSrc, fsSrc);
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

      gl.enableVertexAttribArray(attribs.verts = gl.getAttribLocation(program, 'v'));
      gl.enableVertexAttribArray(attribs.norms = gl.getAttribLocation(program, 'n'));
      gl.enableVertexAttribArray(attribs.tex = gl.getAttribLocation(program, 'tex'));

      uniforms.camTrans = gl.getUniformLocation(program, 'camTrans');
      uniforms.texType = gl.getUniformLocation(program, 'texType');
      uniforms.camRot = gl.getUniformLocation(program, 'camRot');
      uniforms.objRotation = gl.getUniformLocation(program, 'objRotation');
      uniforms.projection = gl.getUniformLocation(program, 'projection');
      uniforms.scale = gl.getUniformLocation(program, 'scale');
      uniforms.lightDir = gl.getUniformLocation(program, 'lightDir');

      gl.uniform3f(uniforms.lightDir, lightDir.x, lightDir.y, lightDir.z);

      gl.uniformMatrix4fv(uniforms.projection, false, new Float32Array([
        1 / (aspectRatio * fovt), 0, 0, 0,
        0, 1 / fovt, 0, 0,
        0, 0, -(far + near) / (far - near), -1,
        0, 0, -2 * far * near / (far - near), 0,
      ]));
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

      let rot = null;

      const t = Date.now();

      for(const [model, set] of Shape.shapes){
        const elemsNum = model.len;

        gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuf);
        gl.bufferData(gl.ARRAY_BUFFER, model.verts, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribs.verts, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, normsBuf);
        gl.bufferData(gl.ARRAY_BUFFER, model.norms, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribs.norms, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texBuf);
        gl.bufferData(gl.ARRAY_BUFFER, model.tex, gl.STATIC_DRAW);
        gl.vertexAttribPointer(attribs.tex, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indBuf);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.inds, gl.STATIC_DRAW);

        for(const shape of set){
          const {obj} = shape;

          gl.uniform3f(uniforms.camTrans, tx + obj.getX(t), ty + obj.getY(t), tz + obj.getZ(t));
          gl.uniform2f(uniforms.texType, shape.mat.x, shape.mat.y);
          gl.uniform1f(uniforms.scale, shape.scale);

          const r = obj.getRot(t);
          if(r !== rot){
            rot = r;
            objRotMat[0] = objRotMat[10] = cos(r);
            objRotMat[2] = -(objRotMat[8] = sin(r));
            gl.uniformMatrix4fv(uniforms.objRotation, false, objRotMat);
          }

          gl.drawElements(gl.TRIANGLES, elemsNum, gl.UNSIGNED_SHORT, 0);
        }
      }

      O.raf(render);
    }
  }
};

module.exports = RenderEngine;