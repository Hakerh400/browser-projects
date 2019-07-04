'use strict';

class Event{
  constructor(type, tile=null){
    this.type = type;
    this.tile = tile;
  }
}

module.exports = Event;