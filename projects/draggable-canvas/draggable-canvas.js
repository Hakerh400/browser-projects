'use strict';

const ZOOM_FACTOR = .9;
const DEFAULT_SCALE = 1;

class DraggableCanvas{
  left = 0;
  top = 0;
  w = 2;
  h = 2;
  wh = 1;
  hh = 1;

  tx = 0;
  ty = 0;
  scale = DEFAULT_SCALE;

  cx = 0;
  cy = 0;

  resizable = 0;
  boundOnResize = this.onResize.bind(this);

  constructor(elem){
    this.elem = elem;

    const canvas = this.canvas = O.ce(elem, 'canvas');
    const g = this.g = this.canvas.getContext('2d');
    this.renderFunc = O.nop;

    this.abc();
    this.resize();

    const render = () => {
      const {w, h, wh, hh, tx, ty, scale} = this;

      g.resetTransform();
      g.clearRect(0, 0, w, h);

      g.translate(wh, hh);
      g.scale(scale, scale);
      const whs = wh / scale;
      const hhs = hh / scale;
      this.renderFunc(tx - whs, ty - hhs, tx + whs, ty + hhs);

      O.raf(render);
    };
    O.raf(render);
  }

  abc(){
    let clicked = 0;

    O.ael('mousemove', evt => {
      const {cx, cy} = this;
      this.updateCursor(evt);

      if(clicked){
        const {scale} = this;

        const dx = this.cx - cx;
        const dy = this.cy - cy;

        this.tx -= dx / scale;
        this.ty -= dy / scale;
      }
    });

    O.ael('mousedown', evt => {
      this.updateCursor(evt);

      const btn = evt.button;
      if(btn === 0) clicked = 1;
    });

    O.ael('mouseup', evt => {
      this.updateCursor(evt);

      const btn = evt.button;
      if(btn === 0) clicked = 0;
    });

    O.ael('wheel', evt => {
      this.updateCursor(evt);

      const {wh, hh, cx, cy, scale} = this;
      const k = evt.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
      const sk = (k - 1) / (k * scale);

      this.tx += (cx - wh) * sk;
      this.ty += (cy - hh) * sk;
      this.scale *= k;
    });

    O.ael('contextmenu', evt => {
      O.pd(evt);
    });

    O.ael('blur', evt => {
      clicked = 0;
    });
  }

  render(func){
    this.renderFunc = func;
  }

  updateCursor(evt){
    const {left, top} = this;
    const {clientX: cx, clientY: cy} = evt;

    this.cx = cx - left;
    this.cy = cy - top;
  }

  resize(){
    const {elem, canvas, g} = this;
    const {x, y, width: w, height: h} = elem.getBoundingClientRect();

    canvas.style.left = `${x}px`;
    canvas.style.top = `${y}px`;

    this.left = x;
    this.top = y;
    this.w = canvas.width = w;
    this.h = canvas.height = h;
    this.wh = this.w / 2;
    this.hh = this.h / 2;
  }

  setResizable(resizable){
    if(resizable === this.resizable) return;

    if(resizable) O.ael('resize', this.boundOnResize);
    else O.rel('resize', this.boundOnResize);

    this.resizable = resizable;
  }

  onResize(){
    this.resize();
  }

  dispose(){
    this.canvas.remove();
  }
}

module.exports = DraggableCanvas;