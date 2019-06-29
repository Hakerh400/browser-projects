'use strict';

class Grid extends O.EventEmitter{
  listeners = O.obj();
  updates = new Set();

  constructor(reng){
    super();

    this.reng = reng;
  }

  emitAndTick(type, tile){
    if(this.emitGridEvent(type, tile)){
      this.tick();
      return 1;
    }

    return 0;
  }

  tick(){
    const {updates} = this;

    this.updates = new Set();
    this.emitGridEvent('tick');
    this.emitGridEventToObjs('update', updates);
  }

  addGridEventListener(type, obj){
    const {listeners} = this;

    if(!(type in listeners))
      listeners[type] = new Set();
    
    listeners[type].add(obj);
  }

  removeGridEventListener(type, obj){
    const {listeners} = this;
    const set = listeners[type];

    if(set.size === 1) delete listeners[type];
    else set.delete(obj);
  }

  emitGridEvent(type, tile=null){
    const objs = this.enumerateListeners(type, tile);
    return this.emitGridEventToObjs(type, objs);
  }

  emitGridEventToObjs(type, objs){
    let consumed = 0;

    while(1){
      const num = objs.size;

      for(const obj of objs){
        if(obj[type]()){
          consumed = 1;
          objs.delete(obj);
        }
      }

      if(objs.size === num) break;
    }

    return consumed;
  }

  enumerateListeners(type, tile=null){
    const {listeners} = this;
    const objs = new Set();

    if(tile !== null)
      for(const obj of tile.objs)
        if(obj.listensL[type])
          objs.add(obj);

    if(type in listeners)
      for(const obj of listeners[type])
        objs.add(obj);

    return objs;
  }

  get target(){ O.virtual('target'); }
  draw(g, t, k){ O.virtual('draw'); }
  zoom(dir){ O.virtual('scroll'); }
  has(){ O.virtual('has'); }
  gen(){ O.virtual('gen'); }
  getRaw(){ O.virtual('getRaw'); }
  get(){ O.virtual('get'); }
  set(){ O.virtual('set'); }
  prune(){ O.virtual('prune'); }
  relocate(){ O.virtual('relocate'); }
}

module.exports = Grid;