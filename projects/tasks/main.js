'use strict';

var urlLocal = `/projects/${O.project}`;
var path = parsePath();

var params = {
  'user': path[0] || 'user1',
  'field': path[1] || 'field1',
  'nav-selected': path[2] || 'details',
};

var icons = null;

window.setTimeout(main);

function main(){
  O.body.style.opacity = '0';

  O.require('icons.js', getIcons => {
    getIcons.getIcons().then(iconsObj => {
      icons = iconsObj;
      injectDOMElements();
    });
  });
}

function injectDOMElements(){
  injectStylesheet();
  injectHTML();
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
  injectHeader();
  injectPageContent();
}

function injectHeader(){
  var header = O.ce(O.body, 'header');
  var headerDiv = O.ce(header, 'div', 'container');
  var headerInner = O.ce(headerDiv, 'div', 'vcenter');

  var left = O.ce(headerInner, 'div', 'left');
  var searchForm = O.ce(left, 'form', 'search-form');
  O.ceLink(searchForm, 'This field', '.');

  var input = O.ce(searchForm, 'input', 'query');
  input.type = 'text';
  input.name = 'q';
  input.placeholder = 'Search';

  var nav = O.ce(left, 'div', 'nav');
  var navInner = O.ce(nav, 'div', 'vcenter');
  O.ceLink(navInner, 'Tasks', '.');
  O.ceLink(navInner, 'Changes', '.');
}

function injectPageContent(){
  var content = O.ce(O.body, 'div', 'content');

  var header = O.ce(O.ce(content, 'div', 'header'), 'div', 'container');
  var div = O.ce(header, 'div', 'above-nav');
  addIcon(div, 'field', '#959da5', 1, 'field-icon');
  O.ceLink(O.ce(div, 'span'), param('user'), url([param('user')]), 'url');
  O.ceText(O.ce(div, 'span', 'above-nav-item path-divider'), '/');
  O.ceLink(O.ce(div, 'span'), param('field'), url([param('user'), param('field')]), 'url strong');

  var nav = O.ce(header, 'div', 'nav-bar');
  var selected = param('nav-selected');

  [
    ['Details', 'details', 'details'],
    ['Tasks', 'task-opened', 'tasks'],
    ['Changes', 'change-request', 'changes'],
    ['Projects', 'project', 'projects'],
  ].forEach(([name, icon, href]) => {
    var s = href === selected;
    var str = s ? ' selected' : '';

    var newPath = [param('user'), param('field')];
    if(href !== 'details')
      newPath.push(href);

    var link = O.ceLink(nav, '', url(newPath), 'nav-item' + str);
    addIcon(link, icon, s ? '#24292e' : '#1b1f23', 1, 'nav-item-icon' + str);
    O.ceText(link, name);
  });
}

function param(param){
  if(!(param in params))
    throw new TypeError(`Unrecognized parameter ${param}`);

  return params[param];
}

function url(newPath){
  return `/?project=${O.project}&path=${newPath.join('/')}`;
}

function addIcon(parent, name, col, size, classNames){
  var canvas = icons.add(name, col, size, classNames)
  parent.appendChild(canvas);
  return canvas;
}

function parsePath(){
  var path = O.urlParam('path');
  if(path === null)
    return '';

  return path.split('/');
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