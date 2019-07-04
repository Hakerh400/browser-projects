'use strict';

class Message{
  consumed = 0;
  ret = null;

  constructor(src, dest, type, data){
    this.src = src;
    this.dest = dest;
    this.type = type;
    this.data = data;
  }

  consume(){
    this.consumed = 1;
  }
}

module.exports = Message;