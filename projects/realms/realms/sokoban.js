'use strict';

const cmn = require('../common-objects');

class Floor extends cmn.Ground{
  static objName = 'floor';

  constructor(tile, target=0){
    super(tile);

    this.target = target;
  }

  ser(s){ s.write(this.target); }
  deser(s){ this.target = s.read(); }

  draw(g, t, k){
    g.fillStyle = this.target ? '#00f' : '#0ff';
    super.draw(g, t, k);
  }
}

class Box extends cmn.Object{
  static objName = 'box';
  static layer = 4;
  static traits = this.initTraits(['occupying', 'pushable']);
  static listenersM = this.initListenersM(['push']);

  draw(g, t, k){
    g.fillStyle = 'yellow';
    g.beginPath();
    g.rect(-.25, -.25, .5, .5);
    g.fill();
    g.stroke();
  }

  push(evt){
    const {tile} = this;

    const dir = evt.src.tile.adjs.indexOf(tile);
    if(dir === -1) return 0;

    return this.tryToMove(dir);
  }
}

class Player extends cmn.Person{
  static objName = 'player';
  static listenersG = this.initListenersG(['navigate']);

  navigate(evt){
    const {dir} = evt;
    const tile = this.tile.adj(dir);
    const {has} = tile;

    if(!has.ground) return 0;
    
    if(!has.occupying){
      this.move(dir);
      return 1;
    }

    if(!has.pushable) return 0;
    if(!this.send(tile.get('pushable'), 'push').consumed) return 0;

    this.move(dir);
    return 1;
  }

  draw(g, t, k){
    g.fillStyle = '#0f0';
    super.draw(g, t, k);
  }
}

module.exports = {
  Floor,
  Box,
  Player,
};