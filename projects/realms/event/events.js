'use strict';

const Event = require('./event');

const events = {
  tick: new Event('tick'),
  beforeTick: new Event('beforeTick'),
  afterTick: new Event('afterTick'),
  update: new Event('update'),
};

module.exports = events;