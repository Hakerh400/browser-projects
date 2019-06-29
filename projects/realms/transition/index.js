'use strict';

const Transition = require('./transition');
const Translation = require('./translation');
const Rotation = require('./rotation');

module.exports = Object.assign(Transition, {
  Translation,
  Rotation,
});