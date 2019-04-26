'use strict';

const Camera = require('./camera');
const Grid = require('./grid');
const Tile = require('./tile');
const Object = require('./object');
const Shape = require('./shape');
const Material = require('./material');
const Model = require('./model');
const Matrix = require('./matrix');
const DiscreteRay = require('./discrete-ray');
const Ray = require('./ray');
const Vector = require('./vector');
const vsSrc = require('./shaders/vs');
const fsSrc = require('./shaders/fs');

const FOV = O.pi / 3;
const NEAR = 1e-3;
const FAR = 1e3;
const CURSOR_SPEED = 3;
const SUNLIGHT_DIR = new Vector(0, -100, 50).norm();

let TICK_TIME = 1e3;
O.ael('keydown', a => {if(a.code === 'Enter')TICK_TIME=prompt('',TICK_TIME)|0});

const {min, max, abs, sin, cos} = Math;

class RenderEngine{
  constructor(canvas){
    this.canvas = canvas;

    const w = this.w = canvas.width;
    const h = this.h = canvas.height;
    [this.wh, this.hh] = [w, h].map(a => a / 2);

    const gl = this.gl = canvas.getContext('webgl2', {
      alpha: false,
      preserveDrawingBuffer: true,
    });

    this.attribs = {};
    this.uniforms = {};

    this.bufs = {
      v1Buf: gl.createBuffer(),
      v2Buf: gl.createBuffer(),
      n1Buf: gl.createBuffer(),
      n2Buf: gl.createBuffer(),
      texBuf: gl.createBuffer(),
      indBuf: gl.createBuffer(),
    };

    this.aspectRatio = w / h;

    this.cam = new Camera(1.24, -4.5, 1.85, 0.479, 2.447, 0);
    
    this.speed = .1;
    this.dir = 0;

    this.cursorLocked = 0;

    // 1 - create object, 2 - destroy object
    this.curAction = 0;

    this.camRot = Matrix.ident();
    this.objRot = Matrix.ident();

    O.enhancedRNG = 0;
    this.grid = new Grid();

    this.renderBound = this.render.bind(this);

    // TODO: Implement this in a better way (don't use `O.z`)
    this.tt = O.now();
    this.sum = 0;
    this.num = 0;
  }

  async init(){
    const {gl} = this;

    this.initCanvas();

    await Material.init(() => {
      return gl.createTexture();
    }, (tex, img) => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });

    this.initGrid();

    this.timePrev = O.now() - TICK_TIME;

    this.render();
    this.aels();
  }

  initCanvas(){
    const {gl, w, h, aspectRatio, attribs, uniforms} = this;

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);

    const col = 169 / 255;
    gl.viewport(0, 0, w, h);
    gl.clearColor(col, col, col, 1.);

    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vsSrc);
    gl.compileShader(vShader);
    if(!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)){
      console.error(`[${'VERTEX'}] ${gl.getShaderInfoLog(vShader)}`);
      return;
    }

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fsSrc);
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

    gl.uniformMatrix4fv(uniforms.projection, false, Matrix.projection(NEAR, FAR, FOV, aspectRatio));
    gl.uniform3f(uniforms.lightDir, ...SUNLIGHT_DIR);
  }

  initGrid(){
    const {grid} = this;

    const n = 20;
    O.repeat(2, y => {
      O.repeat(n, z => O.repeat(n, x => {
        const d = grid.get(x, y, z);

        if(!y) return new Object.Dirt(d);
        if((x || z) && O.rand(40) === 0) new Object.Stone(d);
      }));
    });

    new Object.Man(grid.get(10, 1, 10).purge());
  }

  aels(){
    const {cam} = this;

    O.ael('mousedown', evt => {
      switch(evt.button){
        case 0:
          this.curAction = 2;
          break;

        case 1:
          O.pd(evt);
          if(this.cursorLocked) O.doc.exitPointerLock();
          else this.canvas.requestPointerLock();
          break;

        case 2:
          this.curAction = 1;
          break;
      }
    });

    O.ael('mousemove', evt => {
      if(!this.cursorLocked) return;

      cam.rx = max(min(cam.rx + evt.movementY * CURSOR_SPEED / this.h, O.pih), -O.pih);
      cam.ry = (cam.ry + evt.movementX * CURSOR_SPEED / this.w) % O.pi2;
    });

    O.ael('contextmenu', evt => {
      O.pd(evt);
    });

    O.ael('keydown', evt => {
      if(!this.cursorLocked) return;

      switch(evt.code){
        case 'KeyW': this.dir |= 1; break;
        case 'KeyS': this.dir |= 2; break;
        case 'KeyA': this.dir |= 4; break;
        case 'KeyD': this.dir |= 8; break;
        case 'Space': this.dir |= 16; break;
        case 'ShiftLeft': case 'ShiftRight': this.dir |= 32; break;
      }
    });

    O.ael('keyup', evt => {
      if(!this.cursorLocked) return;

      switch(evt.code){
        case 'KeyW': this.dir &= ~1; break;
        case 'KeyS': this.dir &= ~2; break;
        case 'KeyA': this.dir &= ~4; break;
        case 'KeyD': this.dir &= ~8; break;
        case 'Space': this.dir &= ~16; break;
        case 'ShiftLeft': case 'ShiftRight': this.dir &= ~32; break;
      }
    });

    O.ael(O.doc, 'pointerlockchange', evt => {
      if(!(this.cursorLocked ^= 1))
        this.dir = 0;
    });
  }

  render(){
    const {gl, uniforms, cam, dir, camRot, objRot, grid} = this;

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const time = O.now();
    let timeDiff = time - this.timePrev;

    const newTick = timeDiff >= TICK_TIME;
    if(newTick){
      for(const obj of Object.objs)
        obj.prev.setv(obj);

      this.timePrev += TICK_TIME;
      timeDiff %= TICK_TIME;
      grid.tick();
    }

    const k = timeDiff / TICK_TIME;

    // TODO: Use the exponential moving average algorithm to calculate FPS
    {
      const t = O.now();
      this.sum += t - this.tt;
      this.num++;
      this.tt = t;
      O.z = this.sum / this.num;
      if(this.num === 300) this.sum = this.num = 0;
    }

    if(dir){
      const sp = this.speed;
      let x, y, z;

      if(dir & 3){
        x = sp * -sin(cam.ry);
        z = sp * cos(cam.ry);

        if(dir & 1) cam.x += x, cam.z += z;
        if(dir & 2) cam.x -= x, cam.z -= z;
      }

      if(dir & 12){
        x = sp * -sin(cam.ry);
        z = sp * cos(cam.ry);

        if(dir & 4) cam.x += z, cam.z -= x;
        if(dir & 8) cam.x -= z, cam.z += x;
      }

      if(dir & 16) cam.y -= sp;
      if(dir & 32) cam.y += sp;
    }

    // TODO: use Ray::rotate to acomplish these operations
    const sx = sin(cam.rx), cx = cos(cam.rx);
    const sy = sin(cam.ry), cy = cos(cam.ry);

    camRot[0] = cy;
    camRot[1] = sx * sy;
    camRot[2] = -cx * sy;
    camRot[4] = cx;
    camRot[5] = sx;
    camRot[6] = sy;
    camRot[7] = -sx * cy;
    camRot[8] = cx * cy;

    gl.uniformMatrix3fv(uniforms.camRot, false, camRot);

    // Base translation for objects
    const xx = cam.x + .5;
    const yy = cam.y + .5;
    const zz = cam.z + .5;

    // Find the target tile
    renderTargetTile: {
      // TODO: optimize this
      const ray = new DiscreteRay(-cam.x, -cam.y, -cam.z, ...new Vector(0, 0, 1).rot(cam.rx, O.pi - cam.ry, 0));
      let d = grid.trace(ray, 20, 1, 1);
      if(d === null) break renderTargetTile;

      const {curAction} = this;

      if(curAction !== 0){
        if(curAction === 1){
          d = grid.getv(ray);
          new Object.Stone(d);
        }else{
          d.purge();
        }

        // TODO: optimize this
        ray.set(-cam.x, -cam.y, -cam.z, ...new Vector(0, 0, 1).rot(cam.rx, O.pi - cam.ry, 0));
        d = grid.trace(ray, 20, 1, 1);
        if(d === null) break renderTargetTile;
      }

      const square = Model.square[0];
      this.bufferModel(square);
      gl.uniform3f(uniforms.camTrans, xx + ray.x, yy + ray.y, zz + ray.z);
      gl.uniformMatrix3fv(uniforms.objRotation, false, Vector.dirMat(ray.dir, 0));
      gl.uniform1f(uniforms.scale, 1);
      gl.uniform1i(uniforms.calcLight, 0);
      gl.bindTexture(gl.TEXTURE_2D, Material.hud.tex);
      gl.drawElements(gl.LINE_LOOP, square.len, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(uniforms.calcLight, 1);
    }
    this.curAction = 0;

    let rot = null;

    for(const [models, set] of Shape.shapes){
      const modelsNum = models.length;
      const mul = k * modelsNum;

      const model1Index = mul | 0;
      const model2Index = (model1Index + 1) % modelsNum;
      const model1 = models[model1Index];
      const model2 = models[model2Index];

      gl.uniform1f(uniforms.k, mul % 1);

      this.bufferModels(model1, model2);

      for(const shape of set){
        const {obj} = shape;
        if(obj === null) continue;

        const {x, y, z, ry} = Ray.intp(obj.prev, obj, k).add(xx, yy, zz);
        gl.uniform3f(uniforms.camTrans, x, y, z);
        gl.uniform1f(uniforms.scale, shape.scale);
        gl.bindTexture(gl.TEXTURE_2D, shape.mat.tex);

        if(ry !== rot){
          rot = ry;
          objRot[0] = objRot[8] = cos(ry);
          objRot[2] = -(objRot[6] = sin(ry));
          gl.uniformMatrix3fv(uniforms.objRotation, false, objRot);
        }

        gl.drawElements(gl.TRIANGLES, model1.len, gl.UNSIGNED_SHORT, 0);
      }
    }

    // Render the sky
    {
      const sky = Model.sky[0];
      this.bufferModel(sky);
      gl.uniform3f(uniforms.camTrans, 0, 0, 0);
      objRot[0] = objRot[8] = 1;
      objRot[2] = objRot[6] = 0;
      gl.uniformMatrix3fv(uniforms.objRotation, false, objRot);
      gl.uniform1f(uniforms.scale, 1e3);
      gl.uniform1i(uniforms.calcLight, 0);
      gl.bindTexture(gl.TEXTURE_2D, Material.sky.tex);
      gl.drawElements(gl.TRIANGLES, sky.len, gl.UNSIGNED_SHORT, 0);
      gl.uniform1i(uniforms.calcLight, 1);
    }

    O.raf(this.renderBound);
  }

  bufferModels(m1, m2){
    const {gl, bufs, attribs} = this;

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.v1Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.v1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.v2Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m2.verts, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.v2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.n1Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.norms, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.n1, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.n2Buf);
    gl.bufferData(gl.ARRAY_BUFFER, m2.norms, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.n2, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, bufs.texBuf);
    gl.bufferData(gl.ARRAY_BUFFER, m1.tex, gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribs.tex, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufs.indBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m1.inds, gl.STATIC_DRAW);
  }

  bufferModel(m){
    this.bufferModels(m, m);
  }
};

module.exports = RenderEngine;