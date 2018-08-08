'use strict';

class Content{
  constructor(tabData){
    var [name, flags] = tabData;

    this.name = name;
    this.flags = flags;

    this.str = '';
  }

  getStr(){
    return this.str;
  }

  setStr(str){
    this.str = str;
  }

  toString(){
    return this.getStr();
  }
};

module.exports = Content;