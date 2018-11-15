'use strict';

class EventEmitter{
  constructor(){
    this.ls = O.obj();
  }

  removeListener(type, func){
    var {ls} = this;
    if(!(type in ls)) return;
    ls[type].remove(func);
  }

  removeAllListeners(type){
    delete this.ls[type];
  }

  on(type, func){
    var {ls} = this;
    if(!(type in ls)) ls[type] = new Set();
    ls[type].add(func);
    return this;
  }

  emit(type, ...args){
    var {ls} = this;
    if(!(type in ls)) return;
    ls[type].forEach(func => func(...args));
  }
};

module.exports = EventEmitter;