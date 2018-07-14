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
  async home(){
    return e404();
  },

  async test(){
  },

  async users(){
    var pathLen = path.length;
    var reg = /^[a-z0-9\-]+$/;

    if(pathLen >= 1){
      var user = param(1);
      if(!reg.test(user)) return e404();

      var [userData] = await query(`
        select id, avatar from users
        where nick = ${sqlStr(user)};
      `);

      if(userData.length === 0) return e404();
      userData = userData[0];

      var userId = userData.id | 0;
      var avatarId = userData.avatar | 0;
    }

    if(pathLen === 0 || pathLen === 1){
      var [users] = await query(`
        select * from users;
      `);

      var div = O.ceDiv(content, 'margin-top');
      var header = O.ceDiv(div  );
      var usersNum = O.ce(header, 'h3', 'left title');
      O.ceText(usersNum, `${formatNumber(users.length)} users`);

      var newUserDiv = O.ceDiv(header, 'right');
      var newUserBtn = link(newUserDiv, 'New user', ['new-user'], 'btn btn-primary');

      users.forEach(user => {
        var item = O.ceDiv(div, 'list-item');

        var left = O.ceDiv(item, 'left');
        var avatar = link(left, null, ['users', user.nick], 'avatar left');
        var avatarImg = O.ce(avatar, 'img', 'avatar');
        avatarImg.src = avatarUrl(user.avatar);

        var nick = link(left, user.nick, ['users', user.nick], 'url right left-space');
      });
    }else if(pathLen === 2){
      var div = O.ceDiv(content, 'margin-top');

      var left = O.ceDiv(div, 'user-page-left');
      var avatar = O.ce(left, 'img', 'user-page-avatar');
      avatar.src = avatarUrl(avatarId);

      var nick = O.ce(left, 'span', 'user-page-nick text large');
      O.ceText(nick, user);

      var right = O.ceDiv(div, 'user-page-right');

      var [fields] = await query(`
        select * from fields
        where user = ${userId};
      `);

      var header = O.ceDiv(right  );
      var fieldsNum = O.ce(header, 'h3', 'left title');
      O.ceText(fieldsNum, `${formatNumber(fields.length)} fields`);

      var newUserDiv = O.ceDiv(header, 'right');
      var newUserBtn = link(newUserDiv, 'New field', ['users', user, 'new-field'], 'btn btn-primary');

      fields.forEach(field => {
        var item = O.ceDiv(right, 'list-item');

        var nick = link(item, field.name, ['users', user, 'fields', field.name], 'url');
      });
    }else{
      if(path[2] === 'fields'){
        if(pathLen === 3){
        }else if(pathLen === 4 || pathLen === 5){
          var fieldName = param(3);

          var reg = /^[a-z0-9\-]+$/;
          if(!reg.test(field)) return e404();

          var [field] = await query(`
            select * from fields
            where
              user = ${userId} and
              name = ${sqlStr(fieldName)};
          `);

          if(field.length === 0) return e404();
          field = field[0];

          O.ceDiv(content, 'header-bg');

          var header = O.ceDiv(content, 'header');

          var div = O.ceDiv(header, 'above-nav');
          addIcon(div, 'field', '#959da5', 1, 'field-icon');
          link(O.ce(div, 'span'), user, ['users', user], 'url');
          O.ceText(O.ce(div, 'span', 'above-nav-item path-divider'), '/');
          link(O.ce(div, 'span'), fieldName, ['users', user, 'fields', fieldName], 'url strong');

          var nav = O.ceDiv(header, 'nav-bar');

          var selected = param(4);
          var ss = false;

          [
            ['Details', 'details', null],
            ['Tasks', 'task-opened', 'tasks'],
            ['Changes', 'change-request', 'changes'],
            ['Projects', 'project', 'projects'],
          ].forEach(([name, icon, href]) => {
            var s = href === selected;
            var str = s ? ' selected' : '';
            if(!ss && s) ss = true;

            var newPath = ['users', user, 'fields', fieldName];

            if(href !== null)
              newPath.push(href);

            var linkElem = link(nav, null, newPath, 'nav-item' + str);
            addIcon(linkElem, icon, s ? '#24292e' : '#1b1f23', 1, 'nav-item-icon' + str);
            O.ceText(linkElem, name);
          });

          if(!ss) return e404();

          var main = O.ceDiv(content  );

          switch(selected){
            case null:
              markdown(main, field.details);
              break;

            case 'tasks':
              var nav = O.ceDiv(main, 'tasks-nav');
              var left = O.ceDiv(nav, 'left');

              var search = O.ceDiv(left, 'tasks-search');
              var filters = O.ceDiv(search, 'btn btn-select dropdown chunk-left');
              O.ceText(filters, 'Filters ');

              var searchDiv = O.ceDiv(search, 'inline-block absolute');
              var searchInput = O.ce(searchDiv, 'input', 'tasks-search-input chunk-right');
              searchInput.value = 'is:task is:open';
              addIcon(searchDiv, 'search', '#c6cbd1', 1, 'tasks-search-icon');

              var links = O.ceDiv(left, 'tasks-nav-links');
              var labels = O.ceDiv(links, 'btn btn-link chunk-left');
              O.ceText(labels, 'Labels');

              var milestones = O.ceDiv(links, 'btn btn-link chunk-right');
              O.ceText(milestones, 'Milestones');

              var right = O.ceDiv(nav, 'right');
              var navPath = ['users', user, 'fields', fieldName, 'tasks', 'new'];
              var newTaskBtn = link(right, 'New task', navPath, 'btn btn-primary');
              break;

            default:
              e404();
              break;
          }
        }
      }else{
        e404();
      }
    }
  },

  async ['new-user'](){
    var div = O.ceDiv(content, 'margin-top');
    var form = O.ce(div, 'form');

    var divs = [];
    var elem, block, av, d;

    var avIds = null;
    var chosen = null;

    elem = O.ceDiv(form  );
    O.ceLabel(elem, 'Nick name');
    O.ceInput(elem, 'text', 'input').name = 'nick';

    elem = O.ceDiv(form  );
    O.ceLabel(elem, 'Full name');
    O.ceInput(elem, 'text', 'input').name = 'name';

    O.ceHr(form);

    elem = O.ceDiv(form  );
    O.ceLabel(elem, 'Avatar');

    block = O.ceDiv(elem, 'block');
    av = O.ceRadio(block, 'avatar', 'existing', 'Choose an existing avatar', 'input');
    d = O.ceDiv(block, 'image-choice margin-bottom hidden');
    O.ael(av, 'change', getAvFunc(d));
    divs.push(d);

    block = O.ceDiv(elem, 'block');
    av = O.ceRadio(block, 'avatar', 'new', 'Upload a new one', 'input');
    d = O.ceDiv(block, 'margin-bottom hidden');
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

    var fileDiv = O.ceDiv(divs[1]);
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

      if(!/^[a-z0-9]+(?:\-[a-z0-9]+)*$/.test(nick))
        return errMsg('Nick name may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen');

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

      var sameNick = await query(`
        select id from users
        where nick = ${sqlStr(nick)};
      `);

      if(sameNick[0].length === 1)
        return errMsg(`User with nick name ${sqlStr(nick)} already exists`);

      await query(`
        insert into users
        (nick, name, avatar) values (
          ${sqlStr(nick)},
          ${sqlStr(name, 1)},
          ${avatar}
        );
      `);

      navigate('/');
    }

    function getAvFunc(div){
      return evt => {
        for(var elem of divs) hide(elem);
        show(div);
      };
    }
  },

  async ['404'](){
    var div = O.ceDiv(content, 'margin-top');
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

  if(O.urlParam('reset') === '1'){
    var obj = await server.reset();
    if(obj.error) return log(obj.error);
    log('ok');
    return;
  }

  injectDOMElements();
  aels();
}

function aels(){
  O.ael('keydown', evt => {
    if(evt.code === 'F5'){
      evt.preventDefault();

      if(O.urlParam('reset') === '1'){
        location.reload();
        return;
      }

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
    var div = O.ceDiv(content, 'margin-top error');
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
  var headerDiv = O.ceDiv(header, 'container');
  var headerInner = O.ceDiv(headerDiv, 'vcenter');

  var left = O.ceDiv(headerInner, 'left');
  var searchForm = O.ce(left, 'form', 'search-form');
  link(searchForm, 'This field', []);

  var input = O.ce(searchForm, 'input', 'query');
  input.type = 'text';
  input.name = 'q';

  var nav = O.ceDiv(left, 'nav');
  var navInner = O.ceDiv(nav, 'vcenter');
  link(navInner, 'Tasks', []);
  link(navInner, 'Changes', []);

  return header;
}

function injectPageContent(){
  return O.ceDiv(O.body, 'content container');
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

function markdown(div, text){
  var md = O.ceDiv(div, 'markdown');

  var linkReg = /\[([^\]]+)\]\(([^\)]+)\)/;
  var lines = O.sanl(text);

  lines.forEach((line, index) => {
    if(index !== 0) O.ceBr(md);
    var elem = md;

    var heading = line.match(/^\#*/)[0];
    var hNum = Math.min(heading.length, 6);

    if(hNum !== 0){
      elem = O.ce(elem, `h${hNum}`);
      line = line.substring(hNum);
    }

    while(1){
      var linkMatch = line.match(linkReg);
      if(linkMatch === null) break;

      var {index} = linkMatch;
      if(index !== 0) O.ceText(elem, line.substring(0, index));

      var label = linkMatch[1];
      var href = linkMatch[2];
      link(elem, label, href, 'url');

      line = line.substring(index + linkMatch[0].length);
    }

    if(line !== '')
      O.ceText(elem, line);
  });

  return md;
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

function addIcon(parent, name, col, scale, classNames){
  var canvas = icons.add(name, col, scale, classNames)
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
        O.error(`Cannot load file ${sqlStr(file)}`);
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

function sqlStr(str, convertToNull=false){
  if(str === '' && convertToNull) return 'NULL';
  return JSON.stringify(str);
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