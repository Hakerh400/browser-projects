'use strict';

const URL = 'https://raw.githubusercontent.com/Hakerh400/functional/master/src/index.js';

const tabNames = [
  ['source', 1],
  ['input', 1],
  ['output', 1],
  ['tokenized', 0],
  ['parsed', 0],
  ['compiled', 0],
];

var openTabs = [];
var selectedTab = 'source';

var functional;

window.setTimeout(main);

async function main(){
  O.body.style.opacity = '0';

  injectStylesheet();
  injectElems();

  await loadFromRepo();
  
  aels();
}

function injectElems(){
  var div = O.ceDiv(O.body, 'container');

  var title = O.ce(div, 'h3');
  O.ceText(title, 'Online Functional() Interpreter');

  var tabsMenu = O.ceDiv(div, 'tabs-menu');
  var tabsSpan = O.ce(tabsMenu, 'span', 'tabs-main-span');
  O.ceText(tabsSpan, 'Tabs:');

  tabNames.forEach(([tabName, checked]) => {
    var elem = O.ceDiv(tabsMenu, 'tabs-option');

    var checkBtn = O.ce(elem, 'input');
    checkBtn.type = 'checkbox';

    if(checked){
      checkBtn.checked = 'true';
      openTabs.push(tabName);
    }

    var span = O.ce(elem, 'span', 'tabs-span');
    O.ceText(span, O.cap(tabName));
  });

  var tabsBar = O.ceDiv(div, 'tabs-bar');

  openTabs.forEach(tabName => {
    var tab = O.ceDiv(tabsBar, 'tab');
    tab.id = `tab-${tabName}`;
    tab.innerText = O.cap(tabName);

    if(tabName === selectedTab)
      tab.classList.add('selected');
  });

  var ta = O.ce(div, 'textarea');
  ta.spellcheck = 'false';
  ta.autocorrect = 'off';
  ta.autocapitalize = 'none';
}

function aels(){
  O.ael('keydown', evt => {
    var ctrl = evt.ctrlKey;
    var shift = evt.shiftKey;
    var alt = evt.altKey;

    switch(evt.code){
      case 'Tab':
        //if(!alt) break;
        pd(evt);
        switchTab(shift ? -1 : 1);
        break;

      case 'PageUp':
        if(!alt) break;
        pd(evt);
        swapTabs(-1);
        break;

      case 'PageDown':
        if(!alt) break;
        pd(evt);
        swapTabs(1);
        break;
    }
  });
}

function injectStylesheet(){
  load('style.css').then(styleSrc => {
    var style = O.ce(O.head, 'style');
    style.innerHTML = styleSrc;

    setTimeout(() => {
      O.body.removeAttribute('style');
    });
  });
}

function load(file){
  return new Promise((res, rej) => {
    O.rfLocal(file, (status, data) => {
      if(status !== 200){
        O.error(`Cannot load file ${file}`);
        rej(status);
        return;
      }

      res(data);
    });
  });
}

async function loadFromRepo(){
  functional = await require(URL);
}

function switchTab(dir){
  var index = openTabs.indexOf(selectedTab);
  var len = openTabs.length;

  focusTab((index + dir + len) % len);
}

function swapTabs(dir){
  var index = openTabs.indexOf(selectedTab);
  var indexLimit = dir === -1 ? 0 : openTabs.length - 1;
  if(index === indexLimit) return;

  focusTab(index + dir, 1);
}

function focusTab(index, swap=0){
  if(typeof index === 'string')
    index = openTabs.indexOf(index);

  var i1 = openTabs.indexOf(selectedTab);
  var i2 = index;
  var name1 = selectedTab;
  var name2 = openTabs[i2];
  var tab1 = gebi(`tab-${name1}`);
  var tab2 = gebi(`tab-${name2}`);

  tab1.classList.remove('selected');
  tab2.classList.add('selected');

  if(swap){
    [openTabs[i1], openTabs[i2]] = [name2, name1];
    [tab1.innerText, tab2.innerText] = [O.cap(name2), O.cap(name1)];
    [tab1.id, tab2.id] = [tab2.id, tab1.id];
  }else{
    selectedTab = name2;
  }
}

function gebi(id){
  return O.doc.getElementById(id);
}

function pd(evt){
  O.pd(evt, 1);
}