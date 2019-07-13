'use strict';

const cmn = require('../../common-objects');
const Transition = require('../../transition');
const Pivot = require('../../pivot');

const DigitType = O.enum([
  'HIDDEN',
  'GIVEN',
  'WRITTEN',
  'ILLEGAL',
]);

class Ground extends cmn.Ground{
  static objName = 'tile';
  static DigitType = DigitType;

  constructor(tile, type=DigitType.HIDDEN, digit=null){
    super(tile);

    this.type = type;
    this.digit = digit;
  }

  ser(s){
    const {type, digit} = this;

    s.write(type, 3);
    if(type !== DigitType.HIDDEN) s.write(digit - 1, 8);
  }

  deser(s){
    const type = this.type = s.read(3);
    this.digit = type !== DigitType.HIDDEN ? s.read(8) + 1 : null;
  }

  draw(g, t, k){
    const {type, digit} = this;

    g.fillStyle = '#888';
    super.draw(g, t, k);

    if(type !== DigitType.HIDDEN){
      switch(type){
        case DigitType.GIVEN: g.fillStyle = '#000'; break;
        case DigitType.WRITTEN: g.fillStyle = '#00f'; break;
        case DigitType.ILLEGAL: g.fillStyle = '#f00'; break;
      }

      g.fillText(digit, 0, 0);
    }
  }
}

module.exports = {
  Ground,
};