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

var openedTabs = [];
var selectedTab = 'source';

var functional;

window.setTimeout(main);

async function main(){
  O.body.style.opacity = '0';
  injectStylesheet();

  await injectElems();
  await loadFromRepo();

  log(functional);
}

async function injectElems(){
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
      openedTabs.push(tabName);
    }

    var span = O.ce(elem, 'span', 'tabs-span');
    O.ceText(span, O.cap(tabName));
  });

  var tabsBar = O.ceDiv(div, 'tabs-bar');

  openedTabs.forEach(tabName => {
    var tab = O.ceDiv(tabsBar, 'tab');
    tab.id = `tab-${tabName}`;
    O.ceText(tab, O.cap(tabName));

    if(tabName === selectedTab)
      tab.classList.add('selected');
  });

  var ta = O.ce(div, 'textarea');
  ta.spellcheck = 'false';
  ta.autocorrect = 'off';
  ta.autocapitalize = 'none';
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