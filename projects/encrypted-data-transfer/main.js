'use strict';

const dom = require('./dom');

const REMOTE = 1;
const VERSION = 6;

const UPDATE_INTERVAL = 1e3;
const RETRY_NUM = 5;

const URL = REMOTE ? 'https://e8kkzbh-encrypted-data-transfer.193b.starter-ca-central-1.openshiftapps.com/'
                   : 'http://localhost:8080/';

var pass = null;

window.setTimeout(main);

async function main(){
  await injectStyle();
  await ping();

  pass = await getPass();
  displayMsgs();

  var form = dom.form();
  form.input('name', 'Your name');
  form.input('msg', 'Message');
  form.btn();

  form.on('submit', async () => {
    form.pause();

    var name = encrypt(form.get('name'));
    var msg = encrypt(form.get('msg'));

    var msgInput = form.get('msg', 1);
    msgInput.value = '';
    msgInput.focus();

    await send({type: 'post_msg', name, msg});

    form.resume();
  });
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
    var hash = doubleHash(pass);

    var data = await send({type: 'check_hash', hash});
    if(data) break;

    delete localStorage.pass;
  }

  dom.reset();
  return pass;

  function obtainPass(){
    if('pass' in localStorage) return localStorage.pass;

    return new Promise(res => {
      dom.reset();

      var form = dom.form();
      form.input('pass', 'Enter password');
      form.btn();

      if(!first){
        dom.br(2);
        dom.err('Wrong password. Try again.');
      }

      form.on('submit', () => {
        form.pause();
        first = 0;

        var pass = form.get('pass');
        localStorage.pass = pass;

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
    var msgs = await send({type: 'get_msgs', id});
    id += msgs.length;

    msgs.forEach(msg => {
      addMsg(msg);
    });

    setTimeout(update, UPDATE_INTERVAL);
  }

  function addMsg(message){
    var {name, msg, date} = message;
    var msgElem = dom.div(msgsElem, 'msg');
    
    O.ceText(dom.div(msgElem, 'msg-date'), new Date(date).toGMTString());
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

function encrypt(str){
  return xor(str).toString('hex');
}

function decrypt(str){
  var buff = O.Buffer.from(str, 'hex');
  return xor(buff).toString();
}

function xor(buff){
  if(typeof buff === 'string')
    buff = O.Buffer.from(buff);

  var seed = O.Buffer.from(pass);
  var hash = O.sha256(pass);

  for(var i = 0; i !== buff.length; i++){
    var j = i & 31;
    buff[i] ^= hash[j];

    if(j === 31)
      hash = O.sha256(O.Buffer.concat([hash, pass]));
  }

  return buff;
}

function send(data={}, throwOnError=1, retryNum=RETRY_NUM){
  data.v = VERSION;

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

function doubleHash(data){
  return O.sha256(O.sha256(data)).toString('hex');
}

function error(err){
  O.error(err);
}