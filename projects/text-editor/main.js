'use strict';

const TextEditor = require('./text-editor');

window.setTimeout(main);

function main(){
  var ta = O.ce(O.body, 'textarea');

  ta.style.setProperty('width', '50%', 'important');
  ta.style.setProperty('height', '700px', 'important');
  ta.style.setProperty('min-height', '700px', 'important');

  var editor = new TextEditor(ta);
  editor.focus();
}