'use strict';

const Object = require('../object');
const Entity = require('./entity');

class Person extends Entity{
  static traits = this.initTraits(['friendly', 'person']);

  draw(g, t, k){
    g.beginPath();
    g.arc(0, 0, .4, 0, O.pi2);
    g.fill();
    g.stroke();
  }
}

module.exports = Person;