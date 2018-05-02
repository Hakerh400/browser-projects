'use strict';

var urlLocal = `/projects/${O.project}`;

window.setTimeout(main);

function main(){
  injectDOMElements();

  O.require('icons.js', a => {
    a.getIcons().then(a => {
      O.ce(O.body, 'img').src = a['smiley'];
    });
  });
}

function injectDOMElements(){
  injectStylesheet();
  injectHTML();
}

function injectStylesheet(){
  var link = O.ce(O.head, 'link');
  link.rel = 'stylesheet';
  link.href = `${urlLocal}/style.css`;
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

  var header = O.ce(content, 'div', 'header');
  var headerDiv = O.ce(header, 'div', 'container');
  O.ceText(headerDiv, 'Test');
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