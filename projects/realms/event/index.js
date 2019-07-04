'use strict';

const Event = require('./event');
const Navigate = require('./navigate');

const events = {
  tick: new Event('tick'),
  beforeTick: new Event('beforeTick'),
  afterTick: new Event('afterTick'),
  update: new Event('update'),
};

module.exports = Object.assign(Event, {
  Navigate,

  events,
});