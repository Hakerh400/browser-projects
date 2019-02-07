'use strict';

const states = O.enum([
  'empty',
  'active',
  'transition',
]);

module.exports = states;