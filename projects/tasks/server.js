'use strict';

const PORT = 1037;

const DATE_ATTRIBS = `
  created datetime default current_timestamp,
  modified datetime default current_timestamp on update current_timestamp
`;

const ID_ATTRIB = `id int primary key`;
const ID_ATTRIB_AI = `id int primary key auto_increment`;

const HEADER_ATTRIBS = `
  ${ID_ATTRIB},
  ${DATE_ATTRIBS}
`;

const HEADER_ATTRIBS_AI = `
  ${ID_ATTRIB_AI},
  ${DATE_ATTRIBS}
`;

var proj = O.project;

module.exports = {
  ping,
  reset,
  query,

  avatar: {
    query: avatarQuery,
    insert: insertAvatar,
    upload: uploadAvatar,
  },
};

async function ping(){
  return await post('ping');
}

async function reset(){
  var obj = await query(`
    drop database if exists ${proj};

    create database ${proj}
      character set utf8mb4
      collate utf8mb4_unicode_ci;
  `);
  if(obj.error !== null) return obj;

  obj = await query(`
    create table users (
      ${HEADER_ATTRIBS_AI},
      nick text not null,
      name text,
      avatar int default 1
    );

    create table avatars (
      ${HEADER_ATTRIBS},
      sha512 text not null
    );

    create table fields (
      ${HEADER_ATTRIBS_AI},
      user int not null,
      name text not null,
      details text not null
    );

    create table tasks (
      ${HEADER_ATTRIBS_AI},
      field int not null,
      ind int not null,
      open bit default 1,
      title text not null,
      content text not null
    );
  `);
  if(obj.error !== null) return obj;

  obj = await query(`
    insert into users
    (nick, name, avatar) values (
      'user-1',
      'User Name',
      1
    );

    insert into fields
    (user, name, details) values (
      1,
      'field-1',
      ${JSON.stringify(O.sanl(`
        #header 1
        ${'#'.repeat(8)}header 2
        Some text

        Some link: [link](https://github.com/), another link: [link2](https://github.com/Hakerh400)

        ${'Long text. '.repeat(100)}
      `.trim()).map(a => a.trim()).join('\n'))}
    );

    insert into tasks
    (field, ind, title, content) values (
      1,
      1,
      'Title',
      '#Content\nSome text'
    );
  `);
  if(obj.error !== null) return obj;

  obj = await resetAvatars();
  if(obj.error !== null) return obj;

  return succ();
}

async function resetAvatars(){
  var obj = await avatarQuery('reset');
  if(obj.error !== null) return obj;

  obj = await createDefaultAvatar();
  if(obj.error !== null) return obj;

  return succ();
}

async function createDefaultAvatar(){
  return await new Promise(res => {
    O.rfLocal('default-avatar.png', true, async (status, buff) => {
      var obj = await uploadAvatar(buff);
      if(obj.error !== null) return res(obj);

      res(succ());
    });
  });
}

async function uploadAvatar(buff){
  var obj = await avatarQuery('upload', buff);
  if(obj.error !== null) return obj;

  var data = obj.data;
  var {index, sha512} = data;

  obj = await insertAvatar(index, sha512);
  if(obj.error !== null) return obj;

  return succ(obj.data);
}

async function insertAvatar(index, sha512){
  var obj = await query(`
    select id
      from avatars
      where sha512 = '${sha512}';
  `);
  if(obj.error !== null) return obj;

  var arr = obj.data[0];
  if(arr.length !== 0)
    return succ(arr[0].id | 0);

  obj = await query(`
    insert into avatars
      (id, sha512) values (
        ${index},
        '${sha512}'
      );
  `);
  if(obj.error !== null) return obj;

  return succ(index);
}

async function query(query=null){
  return await post('db', query);
}

async function avatarQuery(path, query=null){
  return await post(`http://localhost:${PORT}/avatars/${path}`, query);
}

async function post(file, query=null){
  if(!file.includes('//'))
    file = `/projects/${proj}/${file}.php`

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
        var msg = responseText !== '' ? ` ${responseText}` : '';
        obj.error = `[Status code: ${xhr.status}]${msg}`;
      }

      res(obj);
    };

    xhr.open('POST', file);
    xhr.send(query);
  });
}

function succ(msg='ok'){
  return {
    data: msg,
    error: null,
  };
}

function err(msg){
  return {
    data: null,
    error: msg,
  };
}