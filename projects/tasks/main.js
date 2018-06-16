'use strict';

var proj = O.project;
var localUrl = getLocalUrl();

var pathPrev = [];
var path = parsePath();

var icons = null;
var server = null;

var header = null;
var content = null;

var modules = [
  'server',
  'icons',
];

var injectElems = {
  home(){
    return e404();
  },

  test(){
  },

  users(){
    if(path.length <= 1){
      query(`
        select * from users;
      `).then(data => {
        var users = data[0];

        var div = O.ce(content, 'div', 'margin-top');
        var header = O.ce(div, 'div');
        var usersNum = O.ce(header, 'h3', 'left title');
        O.ceText(usersNum, `${formatNumber(users.length)} users`);

        var newUserDiv = O.ce(header, 'div', 'right');
        var newUserBtn = link(newUserDiv, 'New user', ['new-user'], 'btn btn-primary');

        users.forEach(user => {
          var item = O.ce(div, 'div', 'list-item');

          var left = O.ce(item, 'div', 'left');
          var avatar = link(left, null, ['users', user.nick], 'avatar left');
          var avatarImg = O.ce(avatar, 'img', 'avatar');
          avatarImg.src = avatarUrl(user.avatar);

          var nick = link(left, user.nick, ['users', user.nick], 'url right left-space');
        });
      }).catch(err => {
        O.ceText(content, err);
      });
    }else{
      e404();
    }
  },

  ['new-user'](){
    var div = O.ce(content, 'div', 'margin-top');
    var form = O.ce(div, 'form');

    var divs = [];
    var elem, block, av, d;

    var avIds = null;
    var chosen = null;

    elem = O.ce(form, 'div');
    O.ceLabel(elem, 'Nick name');
    O.ceInput(elem, 'text', 'input').name = 'nick';

    elem = O.ce(form, 'div');
    O.ceLabel(elem, 'Full name');
    O.ceInput(elem, 'text', 'input').name = 'name';

    O.ceHr(form);

    elem = O.ce(form, 'div');
    O.ceLabel(elem, 'Avatar');

    block = O.ce(elem, 'div', 'block');
    av = O.ceRadio(block, 'avatar', 'existing', 'Choose an existing avatar', 'input');
    d = O.ce(block, 'div', 'image-choice margin-bottom hidden');
    O.ael(av, 'change', getAvFunc(d));
    divs.push(d);

    block = O.ce(elem, 'div', 'block');
    av = O.ceRadio(block, 'avatar', 'new', 'Upload a new one', 'input');
    d = O.ce(block, 'div', 'margin-bottom hidden');
    O.ael(av, 'change', getAvFunc(d));
    divs.push(d);

    // Choose an existing avatar

    query(`
      select id from avatars;
    `).then(data => {
      var div = divs[0];
      var imgs = [];

      avIds = data[0].map((av, index) => {
        var id = av.id | 0;
        var img = O.ce(div, 'img', 'avatar image-item');

        img.src = avatarUrl(id);
        imgs.push(img);

        O.ael(img, 'click', () => {
          if(chosen !== null)
            imgs[chosen].classList.remove('chosen');

          chosen = index;
          imgs[chosen].classList.add('chosen');
        });

        return id;
      });

      chosen = null;
    }).catch(err => {
      avIds = [];
    });

    // Upload a new one

    var fileDiv = O.ce(divs[1], 'div');
    var fileBtn = O.ceLabel(fileDiv, 'Upload new picture', 'btn');
    var fileInput = O.ceInput(fileBtn, 'file', 'top-left transparent');

    O.ceHr(form);

    var submit = link(form, 'Create user', onSubmit, 'btn btn-primary');
    var clicked = false;

    async function onSubmit(){
      if(clicked) return;
      if(avIds === null) return;
      clicked = true;

      var nick = form.nick.value;
      if(nick === '') return errMsg('Please choose a nick name');
      if(nick.length > 50) return errMsg('Nick name is too long (maximum is 50 characters)');
      if(!/^[a-z0-9]+(?:\-[a-z0-9]+)*$/.test(nick)) return errMsg('Nick name may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen');

      var name = form.name.value;
      var avatar = form.avatar.value;

      checkAvatar: {
        if(avIds.length === 0 || avatar === ''){
          avatar = 1;
          break checkAvatar;
        }

        if(avatar === 'existing'){
          if(chosen === null) avatar = 1;
          else avatar = avIds[chosen];
        }else if(avatar === 'new'){
          var files = fileInput.files;

          if(files.length !== 1){
            avatar = 1;
            break checkAvatar;
          }

          var buff = await readFile(files[0]);

          var obj = await server.avatar.upload(buff);
          if(obj.error !== null) return errMsg(obj.error);

          avatar = obj.data;
        }else{
          return errMsg('Unknown option');
        }
      }

      console.log(avatar);
    }

    function getAvFunc(div){
      return evt => {
        for(var elem of divs) hide(elem);
        show(div);
      };
    }
  },

  fields(){
    if(path.length < 3) return e404();

    var user = param(1);
    var field = param(2);
    var selected = param(3, 'details');

    var header = O.ce(content, 'div', 'header');
    header.id = 'field-header';

    var div = O.ce(header, 'div', 'above-nav');
    addIcon(div, 'field', '#959da5', 1, 'field-icon');
    link(O.ce(div, 'span'), user, ['users', user], 'url');
    O.ceText(O.ce(div, 'span', 'above-nav-item path-divider'), '/');
    link(O.ce(div, 'span'), field, ['fields', user, field], 'url strong');

    var nav = O.ce(header, 'div', 'nav-bar');
    var ss = false;

    [
      ['Details', 'details', 'details'],
      ['Tasks', 'task-opened', 'tasks'],
      ['Changes', 'change-request', 'changes'],
      ['Projects', 'project', 'projects'],
    ].forEach(([name, icon, href]) => {
      var s = href === selected;
      var str = s ? ' selected' : '';
      if(!ss && s) ss = true;

      var newPath = ['fields', user, field];
      newPath.push(href);

      var linkElem = link(nav, null, newPath, 'nav-item' + str);
      addIcon(linkElem, icon, s ? '#24292e' : '#1b1f23', 1, 'nav-item-icon' + str);
      O.ceText(linkElem, name);
    });

    if(!ss) return e404();
  },

  ['404'](){
    var div = O.ce(content, 'div', 'margin-top');
    var h1 = O.ce(div, 'h1', 'hcenter');
    O.ceText(h1, '404 Not Found');
  },
};

window.setTimeout(main);

async function main(){
  Object.setPrototypeOf(injectElems, null);

  O.body.style.opacity = '0';

  ({server, icons} = await require(modules));
  icons = await icons.getIcons();

  var obj = await server.ping();
  if(obj.error !== null) server = null;

  /*if(server !== null)
    await server.reset();*/

  injectDOMElements();
  aels();
}

function aels(){
  O.ael('keydown', evt => {
    if(evt.code === 'F5'){
      evt.preventDefault();
      navigate(url(path), 1);
    }
  });

  O.ael('popstate', evt => {
    updatePath();
    loadPage();
  });
}

function loadPage(){
  clearElems();

  var error = O.urlParam('error');

  if(error !== null){
    var div = O.ce(content, 'div', 'margin-top error');
    O.ceText(div, unescape(error));
  }

  var pageType = param(0, 'users');
  if(!(pageType in injectElems)) return e404();

  injectElems[pageType]();
}

function injectDOMElements(){
  injectStylesheet();
  injectHTML();
  loadPage();
}

function injectStylesheet(){
  load('style.css').then(styleSrc => {
    var style = O.ce(O.head, 'style');
    style.innerHTML = styleSrc;

    setTimeout(() => {
      O.body.style.opacity = '1';
    });
  });
}

function injectHTML(){
  header = injectHeader();
  content = injectPageContent();
}

function injectHeader(){
  var header = O.ce(O.body, 'header');
  var headerDiv = O.ce(header, 'div', 'container');
  var headerInner = O.ce(headerDiv, 'div', 'vcenter');

  var left = O.ce(headerInner, 'div', 'left');
  var searchForm = O.ce(left, 'form', 'search-form');
  link(searchForm, 'This field', []);

  var input = O.ce(searchForm, 'input', 'query');
  input.type = 'text';
  input.name = 'q';
  //input.placeholder = 'Search';

  var nav = O.ce(left, 'div', 'nav');
  var navInner = O.ce(nav, 'div', 'vcenter');
  link(navInner, 'Tasks', []);
  link(navInner, 'Changes', []);

  return header;
}

function injectPageContent(){
  return O.ce(O.body, 'div', 'content container');
}

async function require(moduleName){
  if(typeof moduleName === 'string'){
    if(!moduleName.endsWith('.js'))
      moduleName += '.js';

    return await new Promise(res => {
      O.require(moduleName, module => {
        res(module);
      });
    });
  }

  var arr = moduleName;
  var obj = Object.create(null);

  for(moduleName of arr)
    obj[moduleName] = await require(moduleName);

  return obj;
}

function param(index, defaultValue=null){
  if(index < path.length) return path[index];
  else return defaultValue;
}

function url(newPath){
  var url = `/?project=${proj}`;
  if(newPath.length !== 0) url += `&path=${newPath.join('/')}`;
  return url;
}

function link(parent, label, action, classNames=null){
  var href, func;

  if(typeof action === 'string'){
    href = action;
    func = () => navigate(href);
  }else if(action instanceof Array){
    href = url(action);
    func = () => navigate(href);
  }else if(action instanceof Function){
    href = '#';
    func = action;
  }else if(action === null){
    href = '#';
    func = O.nop;
  }

  var link = O.ceLink(parent, label, href, `link ${classNames}`);

  O.ael(link, 'click', evt => {
    evt.preventDefault();
    func(evt);
  });

  return link;
}

function clearElems(){
  for(var elem of [...content.childNodes])
    elem.remove();
}

function navigate(href, hard=false){
  if(hard){
    window.location.href = href;
    return;
  }
  
  var hrefPrev = O.href().match(/\/\/[^\/]*(\/.*)$/)[1];
  if(href === hrefPrev) return;

  history.pushState(null, null, href);

  updatePath();
  loadPage();
}

function updatePath(){
  pathPrev = path;
  path = parsePath();
}

function parsePath(){
  var path = O.urlParam('path');
  if(path === null || path === '') return [];
  return path.split('/');
}

function addIcon(parent, name, col, size, classNames){
  var canvas = icons.add(name, col, size, classNames)
  parent.appendChild(canvas);
  return canvas;
}

function avatarUrl(index){
  return local(`avatars/${index}.png`);
}

function local(path){
  return `${localUrl}${path}`;
}

function getLocalUrl(){
  var base = O.href().match(/^([^\/]*\/\/[^\/]*\/)/)[1];
  var url = `${base}/projects/${proj}/`;

  return url;
}

function errMsg(msg){
  var href = url(path);
  href = `${href}&error=${escape(msg.trim())}`;

  navigate(href);
}

function e404(){
  clearElems();
  injectElems['404']();
}

function show(elem){
  elem.classList.remove('hidden');
}

function hide(elem){
  elem.classList.add('hidden');
}

async function load(file){
  return await new Promise((res, rej) => {
    O.rfLocal(file, (status, data) => {
      if(status !== 200){
        O.error(`Cannot load file "${file}"`);
        rej(status);
        return;
      }

      res(data);
    });
  });
}

async function query(query){
  if(server === null)
    throw 'The server is unavailable.';

  var obj = await server.query(query);
  if(obj.error !== null) throw obj.error;

  return obj.data;
}

async function readFile(file){
  return await new Promise(res => {
    var reader = new FileReader();

    reader.onload = () => {
      res(reader.result);
    };

    reader.readAsArrayBuffer(file);
  });
}

function formatNumber(num){
  num = reverseStr(`${num}`);
  num = num.replace(/.{3}/g, digits => `${digits} `);
  num = reverseStr(num).trim();
  num = num.replace(/ /g, ',');

  return num;
}

function reverseStr(str){
  return str.split('').reverse().join('');
}