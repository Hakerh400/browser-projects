'use strict';

const Update = require('./update');

class UpdatesList extends O.Map2D{
  constructor(){
    super();
  }

  set(x, y, state, num){
    if(!super.has(x, y))
      super.set(x, y, []);
    super.get(x, y).push(new Update(state, num));
  }
};

module.exports = UpdatesList;