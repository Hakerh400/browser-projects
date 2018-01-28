'use strict';

setTimeout(main);

function main(){
  var log = console.log;

  override();
  var result = check();

  log(result ? 'Original' : 'OVERRIDEN');
}

function override(){
  var toPrim = () => '1';

  var nopf = function(){};

  var nop = new Proxy(nopf, {
    getPrototypeOf(){ return null; },
    setPrototypeOf(){ return nop; },
    isExtensible(){ return false; },
    preventExtensions(){ return nop; },
    getOwnPropertyDescriptor(){ return {writable: false} },
    defineProperty(){ return nop; },
    has(){ return nop; },

    get(t, prop){
      if(prop === Symbol.toPrimitive) return toPrim;
      return nop;
    },

    set(){ return nop; },
    deleteProperty(){ return nop; },

    ownKeys(){ return ['prototype']; },

    apply(){ return nop; },
    construct(){ return nop; }
  });

  console.log = nop;
  Function.prototype.toString = new Proxy(Function.prototype.toString, {
    apply(f, t, args){
    }
  });
}

function check(){
  try{
    if(Function.prototype.toString.apply(console.log) !== 'function log() { [native code] }') return false;
    return true;
  }catch(a){
    return false;
  }
}