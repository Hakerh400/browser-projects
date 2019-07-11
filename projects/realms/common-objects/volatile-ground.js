'use strict';

const Object = require('../object');
const Ground = require('./ground');

class VolatileGround extends Ground{
  static traits = this.initTraits(['volatile']);
  static listenersG = this.initListenersM(['update']);

  update(evt){
    log(this.tile.has.heavy);

    if(this.tile.has.heavy)
      this.collapse();
  }
}

module.exports = VolatileGround;