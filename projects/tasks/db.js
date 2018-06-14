'use strict';

var proj = O.project;

module.exports = {
  query,
  reset,
}

async function reset(){
  var obj = await query(`
    drop database if exists ${proj};

    create database ${proj}
      character set utf8mb4
      collate utf8mb4_unicode_ci;
  `);

  if(obj.error !== null)
    return obj;

  return await query(`
    create table users (
      id int primary key auto_increment,
      name text not null,
      email text,
      avatar int default 1
    );

    create table avatars (
      id int primary key auto_increment,
      sha512 text
    );

    create table fields (
      id int primary key auto_increment,
      user int not null,
      name text not null
    );
  `);
}

async function query(query){
  return await post('db', query);
}

async function avatar(query){
  return await post('avatar', query);
}

async function post(file, query){
  var filePath = `/projects/${proj}/${file}.php`;

  return await new Promise(res => {
    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState !== 4) return;

      var responseText = xhr.responseText;

      var obj = {
        data: null,
        error: null,
      };

      if(xhr.status === 200){
        try{
          obj = JSON.parse(responseText);
        }catch(err){
          obj.error = `Unable to parse JSON string: ${err.message}`;
        }
      }else{
        obj.error = `[${xhr.status}] ${responseText}`;
      }

      res(obj);
    };

    xhr.open('POST', filePath);
    xhr.send(query);
  });
}