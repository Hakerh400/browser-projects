'use strict';

const REMOTE = 1;
const VERSION = '2.1.0';

const PUBLIC = 1;
const ADMIN = 'admin' in localStorage;

if(!PUBLIC && !ADMIN) return O.error('The server is under maintenance');
if(REMOTE) O.ceText(O.ce(O.body, 'h1'), 'Loading...');

const DOM = require('./dom');

const PROJECT_NAME = 'e8kkzbh';
const HTTP_METHOD = 'POST';

const UPDATE_INTERVAL = 1e3;
const RETRY_NUM = 5;

const WEBSITE_URL = 'https://e8kkzbh.github.io/';
const SERVER_URL = REMOTE ? 'https://e8kkzbh-encrypted-data-transfer.193b.starter-ca-central-1.openshiftapps.com/'
                          : 'http://localhost:8080/';

const ERR_MSG = null;

const M = VERSION.match(/^\d+/) | 0;

var dom = null;
var storage = null;
var userName = null;
var pass = null;
var secretKey = null;

window.setTimeout(() => init().catch(onError));

async function init(){
  if(REMOTE && window.location.href !== WEBSITE_URL){
    window.location.href = WEBSITE_URL;
    return;
  }

  O.ael('error', onError);

  dom = new DOM(O.body, REMOTE);
  dom.on('reset', onDomReset);

  storage = createStorage();

  if((storage.get('M') | 0) !== M){
    storage.reset();

    storage = createStorage();
    storage.set('M', M);

    refreshPage();
    return;
  }

  pass = storage.get('pass');

  await main();
}

async function main(){
  await injectStyle();
  await ping();

  pass = await getPass();
  userName = encrypt(storage.get('name', ''));

  displayMsgs();
  if(ERR_MSG !== null) displayErrMsg();
  displayForm();
}

function onError(err){
  O.rel('error', onError);

  setTimeout(() => {
    if(!REMOTE) throw err;
    O.error(err);
  });
}

function onDomReset(){
  if(!REMOTE) dom.warn('[LOCAL]');
  if(!PUBLIC) dom.warn('[PRIVATE]');

  dom.msg(`Version: ${VERSION}`);
  dom.br();
}

function createStorage(){
  return new O.Storage(localStorage, null, PROJECT_NAME);
}

function injectStyle(){
  return new Promise(res => {
    O.rfLocal('style.css', (status, data) => {
      if(status !== 200) return O.error('Unable to load CSS');

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
        dom.br();
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

  update().catch(onError);

  async function update(){
    var msgs = await send({type: 'get_msgs', name: userName, id});
    id += msgs.length;

    msgs.forEach(msg => {
      addMsg(msg);
    });

    setTimeout(() => update().catch(onError), UPDATE_INTERVAL);
  }

  function addMsg(message){
    var {name, msg, date, seen} = message;
    var msgElem = dom.div(msgsElem, 'msg');

    seen = O.sortAsc(seen.map(a => decrypt(a)));

    var msgInfo = new Date(date * 1e3).toGMTString();
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
  form.input('name', 'Your name').disabled = 1;
  form.input('msg', 'Message').disabled = 1;

  form.btn().disabled = 1;
  form.btn('Reset storage').disabled = 1;

  var name = storage.get('name');
  if(name === null){
    if(!ADMIN) form.focus('name');
  }else{
    form.val('name', name);
    if(!ADMIN) form.focus('msg');
  }

  form.on('input', async evt => {
    switch(evt.name){
      case 'name': form.focus('msg'); break;
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

  form.on('btn', async evt => {
    switch(evt.name){
      case 'Reset storage': resetStorage(1); break;
    }
  });
}

function displayErrMsg(){
  dom.err(`ERROR: ${ERR_MSG}`, 1);
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

    xhr.open(HTTP_METHOD, SERVER_URL);
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