'use strict';

const cmn = require('../common-objects');

class Floor extends cmn.Ground{
  static objName = 'floor';

  static gradients = this.initGradients([
    [-.5, -.5, .5, .5, '#fff', '#888'],
    [-.5, -.5, .5, .5, '#f0f', '#808'],
  ]);

  constructor(tile, target=0){
    super(tile);

    this.target = target & 1;
  }

  ser(s){ s.write(this.target); }
  deser(s){ this.target = s.read(); }

  draw(g, t, k){
    g.fillStyle = this.gradient(g, this.target);
    super.draw(g, t, k);
  }
}

class Box extends cmn.Object{
  static objName = 'box';
  static layer = 4;
  static traits = this.initTraits(['occupying', 'pushable']);
  static listenersM = this.initListenersM(['push']);

  draw(g, t, k){
    const s1 = .3;
    const s2 = .215;
    const s3 = .075;

    g.fillStyle = '#ff0';
    g.beginPath();
    g.rect(-s1, -s1, s1 * 2, s1 * 2);
    g.fill();
    g.stroke();

    g.fillStyle = '#880';
    g.beginPath();
    g.rect(-s2, -s2, s2 * 2, s2 * 2);
    g.fill();
    g.stroke();

    g.fillStyle = '#ff0';
    g.beginPath();
    g.moveTo(s2 - s3, -s2);
    g.lineTo(s2, -s2);
    g.lineTo(s2, -s2 + s3);
    g.lineTo(-s2 + s3, s2);
    g.lineTo(-s2, s2);
    g.lineTo(-s2, s2 - s3);
    g.closePath();
    g.fill();
    g.stroke();
    g.beginPath();
    g.moveTo(-s2 + s3, -s2);
    g.lineTo(-s2, -s2);
    g.lineTo(-s2, -s2 + s3);
    g.lineTo(s2 - s3, s2);
    g.lineTo(s2, s2);
    g.lineTo(s2, s2 - s3);
    g.closePath();
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