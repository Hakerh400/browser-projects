'use strict';

const Event = require('./event');
const Navigate = require('./navigate');
const events = require('./events');

module.exports = Object.assign(Event, {
  Navigate,

  events,
});