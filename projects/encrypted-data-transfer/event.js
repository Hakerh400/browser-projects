'use strict';

class Event{
  constructor(orig){
    this.orig = orig;

    this.defaultPrevented = 0;
  }

  preventDefault(){
    this.defaultPrevented = 1;
  }
};

module.exports = Event;