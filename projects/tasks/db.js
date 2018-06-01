'use strict';

var dbPhp = `/projects/${O.project}/db.php`;

var db = {
  async post(obj=null){
    var res = await fetch(dbPhp, obj);
  },
  async test(){
    await db.post();
  },
};

module.exports = db;