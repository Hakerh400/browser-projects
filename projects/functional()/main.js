'use strict';

const Content = require('./content');

const repoUrl = 'https://raw.githubusercontent.com/Hakerh400/functional/master/src/index.js';

const SYMBOL_X = '\u2a2f';
const SYMBOL_O = '\u25cf';

const tabsData = [
  ['source',     0x01n],
  ['input',      0x01n],
  ['output',     0x01n],
  ['tokenized',  0x00n],
  ['parsed',     0x00n],
  ['bytecode',   0x00n],
  ['normalized', 0x00n],
];

var openTabs = [];
var tabsContent = O.obj();
var selectedTab = 0;

var functional = null;
var ta = null;

window.setTimeout(main);

async function main(){
  O.body.style.opacity = '0';

  injectStylesheet();
  injectElems();

  //await loadFromRepo();
  
  aels();
}

function injectElems(){
  var div = O.ceDiv(O.body, 'container');

  var title = O.ce(div, 'h3');
  O.ceText(title, 'Online Functional() Interpreter');

  var tabsMenu = O.ceDiv(div, 'tabs-menu');
  var tabsSpan = O.ce(tabsMenu, 'span', 'tabs-main-span');
  O.ceText(tabsSpan, 'Tabs:');

  var tabsOptions = O.ceDiv(tabsMenu, 'tabs-options');
  var openTabs = [];

  tabsData.forEach(tabData => {
    var [name, flags] = tabData;

    var elem = O.ceDiv(tabsOptions, 'tabs-option');
    var checkBtn = O.ce(elem, 'input');
    checkBtn.type = 'checkbox';

    if(flags & 1n)
      openTabs.push(name);

    var span = O.ce(elem, 'span', 'tabs-span');
    O.ceText(span, O.cap(name));
  });

  var tabsBar = O.ceDiv(div, 'tabs-bar');

  openTabs.forEach((tabName, index) => {
    var tab = openTab(index);

    if(index === selectedTab)
      tab.classList.add('selected');
  });

  ta = O.ce(div, 'textarea');
  ta.spellcheck = 'false';
  ta.autocorrect = 'off';
  ta.autocapitalize = 'none';

  ta.focus();
}

function aels(){
  O.ael('keydown', evt => {
    var ctrl = evt.ctrlKey;
    var shift = evt.shiftKey;
    var alt = evt.altKey;

    switch(evt.code){
      case 'Tab':
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

  O.ael('click', evt => {
    var {target} = evt;
    var e;

    if(find('.tab-close-btn')){
      var e1 = e.closest('.tab');
      var index = [...e1.parentElement.children].indexOf(e1);
      closeTab(index);
      return;
    }

    if(find('.tabs-option input')){
      var e1 = e.closest('.tabs-option');

      if(e.checked){
        var index = [...e1.parentElement.children].indexOf(e1);
        openTab(index, 0);
      }else{
        if(openTabs.length === 1){
          e.checked = 1;
          return;
        }

        var name = qs(e1, '.tabs-span').textContent;
        closeTab(name, 0);
      }

      return;
    }

    if(find('.tab')){
      var index = [...e.parentElement.children].indexOf(e);
      focusTab(index);
      return;
    }

    function find(selector){
      e = target.closest(selector);
      return e;
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
  functional = await require(repoUrl);
}

function openTab(index, updateCheck=1){
  var tabData = tabsData[index];
  var name = tabData[0];

  if(updateCheck) checkTab(name);
  openTabs.push(name);

  if(!(name in tabsContent))
    tabsContent[name] = new Content(tabData);

  var tabsBar = qs('.tabs-bar');
  var tab = O.ceDiv(tabsBar, 'tab');

  var span = O.ce(tab, 'span', 'tab-name');
  span.textContent = O.cap(name);

  var closeBtn = O.ceDiv(tab, 'tab-close-btn');
  O.ceText(closeBtn, SYMBOL_X);

  return tab;
}

function closeTab(index=selectedTab, updateCheck=1){
  if(openTabs.length === 1) return;

  index = getTabIndex(index);
  if(updateCheck) uncheckTab(index);

  qs(`.tab:nth-child(${index + 1})`).remove();
  openTabs.splice(index, 1);

  if(index <= selectedTab){
    if(index === selectedTab){
      if(index !== 0) index--;
      else index = 0;

      selectedTab = null;
      focusTab(index);
    }else{
      if(selectedTab !== 0) selectedTab--;
      else selectedTab = 0;
    }
  }
}

function saveTab(){
}

function switchTab(dir){
  var index = selectedTab;
  var len = openTabs.length;

  focusTab((index + dir + len) % len);
}

function swapTabs(dir){
  var index = selectedTab;
  var indexLimit = dir === -1 ? 0 : openTabs.length - 1;
  if(index === indexLimit) return;

  focusTab(index + dir, 1);
}

function focusTab(index, swap=0){
  if(typeof index === 'string') index = openTabs.indexOf(index);
  if(index === selectedTab) return;

  if(selectedTab !== null){
    var i1 = selectedTab;
    var name1 = openTabs[i1];
    var tab1 = qs(`.tab:nth-child(${i1 + 1})`);
    var tabName1 = qs(tab1, '.tab-name');

    tab1.classList.remove('selected');
    tabsContent[name1].setStr(ta.value);
  }

  var i2 = index;
  var name2 = openTabs[i2];
  var tab2 = qs(`.tab:nth-child(${i2 + 1})`);
  var tabName2 = qs(tab2, '.tab-name');

  tab2.classList.add('selected');
  selectedTab = i2;

  if(swap){
    [openTabs[i1], openTabs[i2]] = [name2, name1];
    [tabName1.textContent, tabName2.textContent] = [O.cap(name2), O.cap(name1)];

    return;
  }

  ta.value = tabsContent[name2].getStr();
}

function checkTab(index){
  updateChecked(index, 1);
}

function uncheckTab(index){
  updateChecked(index, 0);
}

function updateChecked(index, checked){
  var name = getTabName(index);

  var tabOption = qsa('.tabs-option').find(e => {
    e = qs(e, '.tabs-span');
    return e.textContent.toLowerCase() === name;
  });

  qs(tabOption, 'input').checked = checked;
}

function getTabIndex(name){
  if(typeof name === 'number') return name;
  name = name.toLowerCase();
  
  var index = qsa('.tab-name').findIndex(e => {
    return e.textContent.toLowerCase() === name;
  });

  return index;
}

function getTabName(index){
  var name;

  if(typeof index === 'string') name = index;
  else name = qs(qs(`.tab:nth-child(${index + 1})`), '.tab-name').textContent;

  return name.toLowerCase();
}

function qs(e, selector=null){
  if(selector === null) selector = e, e = O.doc;
  return e.querySelector(selector);
}

function qsa(e, selector=null){
  if(selector === null) selector = e, e = O.doc;
  return [...e.querySelectorAll(selector)];
}

function pd(evt){
  O.pd(evt, 1);
}