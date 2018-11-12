'use strict';

const REMOTE = 1;
const VERSION = 9;

if(REMOTE) O.ceText(O.ce(O.body, 'h1'), 'Loading...');

const DOM = require('./dom');

const PROJECT_NAME = 'e8kkzbh';

const UPDATE_INTERVAL = 1e3;
const RETRY_NUM = 5;

const URL = REMOTE ? 'https://e8kkzbh-encrypted-data-transfer.193b.starter-ca-central-1.openshiftapps.com/'
                   : 'http://localhost:8080/';

const ERR_MSG = null;

const dom = new DOM(O.body, REMOTE);
const storage = new O.Storage(localStorage, null, PROJECT_NAME);

var userName = null;
var pass = storage.get('pass');

var secretKey = null;

window.setTimeout(main);

async function main(){
  await injectStyle();
  await ping();
  O.body.innerHTML = '';

  pass = await getPass();
  userName = encrypt(storage.get('name', ''));

  displayMsgs();
  displayErrMsg();
  displayForm();
}

function injectStyle(){
  return new Promise(res => {
    O.rfLocal('style.css', (status, data) => {
      if(status !== 200) return O.error('Unable to load style');

      var style = O.ce(O.head, 'style');
      style.innerHTML = data;

      res(style);
    });
  });
}

async function ping(){
  await send({type: 'ping'});
}

async function getPass(){
  var first = 1;

  while(1){
    var pass = await obtainPass();
    var hash = sha256(`[${pass}]`, 1);

    var {data} = await send({type: 'get_secret_key', hash}, 0);

    if(data !== null){
      secretKey = data;
      break;
    }

    storage.remove('pass');
  }

  dom.reset();
  return pass;

  function obtainPass(){
    if(storage.has('pass')) return storage.get('pass');

    return new Promise(res => {
      dom.reset();

      var form = dom.form();
      form.input('pass', 'Enter password', 1);
      form.btn();

      if(!first){
        dom.br(2);
        dom.err('Wrong password. Try again.');
      }

      form.on('submit', evt => {
        evt.preventDefault();
        first = 0;

        var pass = form.get('pass');
        storage.set('pass', pass);

        res(pass);
      });
    });
  }
}

function displayMsgs(){
  var msgsElem = dom.div(O.body, 'msgs');
  var id = 0;

  update();

  async function update(){
    var msgs = await send({type: 'get_msgs', name: userName, id});
    id += msgs.length;

    msgs.forEach(msg => {
      addMsg(msg);
    });

    setTimeout(update, UPDATE_INTERVAL);
  }

  function addMsg(message){
    var {name, msg, date, seen} = message;
    var msgElem = dom.div(msgsElem, 'msg');

    seen = seen.map(a => decrypt(a));

    var msgInfo = new Date(date).toGMTString();
    msgInfo += `; seen by: ${seen.join(', ')}`;
    
    O.ceText(dom.div(msgElem, 'msg-info'), msgInfo);
    O.ceText(dom.div(msgElem, 'msg-name'), `${decrypt(name)}:`);

    var msgBody = dom.div(msgElem, 'msg-body');
    formatMsg(msgBody, decrypt(msg));

    msgsElem.scrollTo(0, msgsElem.scrollHeight);
  }
}

function formatMsg(elem, str){
  str = str.replace(/\s+/g, ' ').trim();

  var reg = /\[([^\]]+)\]\((https?\:\/\/[^\)]+)\)/;

  while(1){
    var match = str.match(reg);
    if(match === null) break;

    var {index} = match;
    if(index !== 0)
      O.ceText(elem, str.substring(0, index));

    var link = O.ce(elem, 'a');
    link.href = match[2];
    link.target = '_blank';
    O.ceText(link, match[1]);

    str = str.substring(index + match[0].length);
  }

  if(str.length !== 0)
    O.ceText(elem, str);
}

function displayForm(){
  var form = dom.form();
  form.input('name', 'Your name');
  form.input('msg', 'Message');
  form.btn();
  form.btn('Reset storage');

  var name = storage.get('name');
  if(name === null){
    form.focus('name');
  }else{
    form.val('name', name);
    form.focus('msg');
  }

  form.on('btn', async evt => {
    switch(evt.name){
      case 'Reset storage': resetStorage(1); break;
    }
  });

  form.on('submit', async evt => {
    var name = form.get('name');
    var msg = form.get('msg');

    storage.set('name', name);
    form.focus('msg', '');

    userName = encrypt(name);
    await send({type: 'post_msg', name: userName, msg: encrypt(msg)});
  });
}

function displayErrMsg(){
  if(ERR_MSG === null) return;
  dom.err(`ERROR: ${ERR_MSG}`);
}

function resetStorage(askUserToConfirm){
  if(askUserToConfirm && !confirm('Are you sure you want to reset the local storage data?'))
    return;

  storage.reset();
  refreshPage();
}

function encrypt(str){
  return xor(str).toString('hex');
}

function decrypt(str){
  var buf = O.Buffer.from(str, 'hex');
  return buf2str(xor(buf));
}

function xor(buf){
  if(typeof buf === 'string')
    buf = str2buf(buf);

  var seed = O.Buffer.from(pass);
  var hash = sha256(pass);

  for(var i = 0; i !== buf.length; i++){
    var j = i & 31;
    buf[i] ^= hash[j];

    if(j === 31)
      hash = sha256(O.Buffer.concat([hash, pass]));
  }

  return buf;
}

function send(data={}, throwOnError=1, retryNum=RETRY_NUM){
  data.ver = VERSION;
  data.key = secretKey;

  return new Promise(res => {
    var xhr = new window.XMLHttpRequest();

    xhr.onreadystatechange = async () => {
      if(xhr.readyState === 4){
        var {status} = xhr;

        if(status !== 200){
          if(status === 0){
            if(retryNum === 0)
              return error('The server is unavailable');

            res(await send(data, throwOnError, retryNum - 1));
            return;
          }

          return error(`The server responded with status code ${status}`);
        }

        try{ var json = JSON.parse(xhr.responseText); }
        catch(error){ return error(err); }

        if(throwOnError){
          if(json.err !== null) return error(json.err);
          return res(json.data);
        }

        res(json);
      }
    };

    xhr.open('POST', URL);
    xhr.send(JSON.stringify(data));
  });
}

function str2buf(str){
  var len = str.length;
  var buf = O.Buffer.alloc(len << 1);

  for(var i = 0; i !== len; i++){
    var j = i << 1;
    var cc = O.cc(str, i);

    buf[j] = cc;
    buf[j + 1] = cc >> 8;
  }

  return buf;
}

function buf2str(buf){
  var len = buf.length >> 1;
  var str = '';

  for(var i = 0; i !== len; i++){
    var j = i << 1;
    str += O.sfcc(buf[j] | (buf[j + 1] << 8));
  }

  return str;
}

function sha256(buf, stringify){
  var out = O.sha256(buf);
  if(stringify) out = out.toString('hex');
  return out;
}

function refreshPage(){
  O.doc.documentElement.innerHTML = '';
  window.location.reload();
}

function error(err){
  O.error(err);
}