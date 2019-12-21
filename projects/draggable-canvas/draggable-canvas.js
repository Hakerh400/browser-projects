'use strict';

const {min, max} = Math;

const ZOOM_FACTOR = .9;

const ctxProps = [
  'fillStyle',
  'strokeStyle',
  'lineWidth',
  'textBaseline',
  'textAlign',
  'font',
];

O.addStyle('/projects/draggable-canvas/style');

class DraggableCanvas{
  left = 0;
  top = 0;
  w = 2;
  h = 2;
  wh = 1;
  hh = 1;

  tx = 0;
  ty = 0;

  cx = 0;
  cy = 0;

  scale = 1;
  bg = '#fff';

  resizable = 0;
  visible = 0;

  locked = 0;
  clicked = 0;
  dragged = 0;

  listeners = new Map();
  boundRender = this.render.bind(this);

  renderFunc = null;
  onMouseDown = null;
  onMouseUp = null;
  onMouseMove = null;
  onClick = null;
  onWheel = null;
  onMouseEnter = null;
  onMouseLeave = null;
  onFocus = null;
  onBlur = null;
  onKeyDown = null;

  homeBtn = null;

  constructor(elem){
    this.elem = elem;

    const canvas = this.canvas = O.ce(elem, 'canvas');
    const g = this.g = this.canvas.getContext('2d');

    canvas.classList.add('draggable-canvas', 'hidden');
  }

  show(){
    const {canvas} = this;
    
    canvas.classList.remove('hidden');
    canvas.classList.add('visible');
    this.visible = 1;

    this.update();
    this.aels();

    if(!this.renderScheduled)
      this.boundRender();
  }

  hide(){
    const {canvas} = this;

    canvas.classList.remove('visible');
    canvas.classList.add('hidden');
    this.visible = 0;

    this.rels();
  }

  render(){
    this.renderScheduled = 0;
    if(!this.visible) return;

    const {g, w, h, wh, hh, tx, ty, scale} = this;

    g.resetTransform();
    g.fillStyle = this.bg;
    g.fillRect(0, 0, w, h);

    g.translate(wh, hh);
    g.scale(scale, scale);
    g.translate(-tx, -ty);

    const whs = wh / scale;
    const hhs = hh / scale;

    if(this.renderFunc !== null)
      this.renderFunc(tx - whs, ty - hhs, tx + whs, ty + hhs);

    this.renderScheduled = 1;
    O.raf(this.boundRender);
  }

  aels(){
    const {canvas} = this;

    this.ael('mousemove', evt => {
      const {cx, cy} = this;
      this.updateCursor(evt);

      if(this.clicked){
        const {scale} = this;

        const dx = this.cx - cx;
        const dy = this.cy - cy;

        this.tx -= dx / scale;
        this.ty -= dy / scale;

        this.dragged = 1;
        return;
      }

      this.emitEvt(this.onMouseMove, evt);
    });

    this.ael('mousedown', evt => {
      this.updateCursor(evt);
      this.emitEvt(this.onMouseDown, evt);
      if(this.locked) return;

      const btn = evt.button;

      if(btn === 0){
        this.clicked = 1;
        this.dragged = 0;
      }
    });

    this.ael('mouseup', evt => {
      this.updateCursor(evt);
      this.emitEvt(this.onMouseUp, evt);
      if(this.locked) return;

      const btn = evt.button;

      if(btn === 0){
        this.clicked = 0;
        if(!this.dragged) this.emitEvt(this.onClick, evt);
      }
    });

    this.ael('wheel', evt => {
      O.pd(evt);
      this.updateCursor(evt);
      this.emitEvt(this.onWheel, evt);
      if(!this.resizable) return;

      const {wh, hh, cx, cy, scale} = this;
      const k = evt.deltaY < 0 ? 1 / ZOOM_FACTOR : ZOOM_FACTOR;
      const sk = (k - 1) / (k * scale);

      this.tx += (cx - wh) * sk;
      this.ty += (cy - hh) * sk;
      this.scale *= k;
    });

    this.ael('resize', evt => {
      this.update();
    });

    this.ael('contextmenu', evt => {
      O.pd(evt);
    });

    this.ael(canvas, 'mouseenter', evt => {
      this.emitEvt(this.onMouseEnter, evt);
    });

    this.ael(canvas, 'mouseleave', evt => {
      this.emitEvt(this.onMouseLeave, evt);
    });

    this.ael('focus', evt => {
      this.emitEvt(this.onFocus, evt);
    });

    this.ael('blur', evt => {
      this.clicked = 0;
      this.dragged = 0;
      this.emitEvt(this.onBlur, evt);
    });

    this.ael('keydown', evt => {
      this.emitEvt(this.onKeyDown, evt);

      if(evt.code === this.homeBtn)
        this.setTranslate(0, 0);
    });
  }

  rels(){
    const {listeners} = this;

    for(const [target, obj] of listeners)
      for(const type in obj)
        O.rel(target, type, obj[type]);

    listeners.clear();
  }

  ael(target, type, func=null){
    if(func === null){
      func = type;
      type = target;
      target = window;
    }

    const {listeners} = this;

    O.ael(target, type, func);

    if(!listeners.has(target)) listeners.set(target, O.obj());
    listeners.get(target)[type] = func;
  }

  emitEvt(func, evt){
    if(func === null) return;

    const {wh, hh, tx, ty, scale, cx, cy} = this;
    const x = (cx - wh) / scale + tx;
    const y = (cy - hh) / scale + ty;

    func(evt, x, y);
  }

  updateCursor(evt){
    const {left, top} = this;
    const {clientX: cx, clientY: cy} = evt;

    this.cx = cx - left;
    this.cy = cy - top;
  }

  lock(){
    this.locked = 1;
    this.clicked = 0;
    this.dragged = 0;
  }

  unlock(){
    this.locked = 0;
    this.clicked = 0;
    this.dragged = 0;
  }

  setRect(x1, y1, x2, y2){
    const {w, h, wh, hh} = this;

    const scale = this.scale = min(w / (x2 - x1), h / (y2 - y1));
    const tx = this.tx = (x1 + x2) / 2;
    const ty = this.ty = (y1 + y2) / 2;
  }

  setTranslate(tx, ty){
    this.tx = tx;
    this.ty = ty;
    return this;
  }

  setScale(scale){
    this.scale = scale;
    return this;
  }

  setBg(bg){
    this.bg = bg;
    return this;
  }

  update(){
    const {elem, canvas, g} = this;
    const {x, y, width: w, height: h} = elem.getBoundingClientRect();

    canvas.style.left = `${x}px`;
    canvas.style.top = `${y}px`;

    const ctxData = O.obj();

    for(const prop of ctxProps)
      ctxData[prop] = g[prop];

    this.left = x;
    this.top = y;
    this.w = canvas.width = w;
    this.h = canvas.height = h;
    this.wh = this.w / 2;
    this.hh = this.h / 2;

    Object.assign(g, ctxData);
  }

  setResizable(resizable){
    this.resizable = resizable;
    return this;
  }

  setHomeBtn(btn){
    this.homeBtn = btn;
  }

  clearHomeBtn(){
    this.homeBtn = null;
  }

  dispose(){
    this.canvas.remove();
  }
}

module.exports = DraggableCanvas;