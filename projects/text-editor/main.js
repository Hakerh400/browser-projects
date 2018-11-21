'use strict';

const TAB_SIZE = 2;
const TAB = ' '.repeat(TAB_SIZE);

window.setTimeout(main);

function main(){
  var ta = O.ce(O.body, 'textarea');

  ta.style.setProperty('width', '50%', 'important');
  ta.style.setProperty('height', '700px', 'important');
  ta.style.setProperty('min-height', '700px', 'important');

  O.ael(ta, 'keydown', onKeyDown);
  ta.focus();
}

function onKeyDown(evt){
  evt.preventDefault();

  var ta = evt.target;
  var {key} = evt;

  var alt = evt.altKey;
  var ctrl = evt.ctrlKey;
  var shift = evt.shiftKey;
  var fKey = /^F\d+$/.test(key) ? key.slice(1) | 0 : 0;

  if(fKey){
    switch(fKey){
      case 5:
        window.location.reload();
        break;
    }

    return;
  }

  if(key.length === 1 && !(alt || ctrl || fKey)){
    var s = key;

    if(s === '(') s += ')';
    else if(s === '[') s += ']';
    else if(s === '{') s += '}';
    else if(/[)\]}'"`]/.test(s) && getCharRel(0) === s) s = '';
    else if(/['"`]/.test(s)) s += s;

    insert(s, 0);
    moveRel(1);

    return;
  }

  var val = ta.value;
  var len = val.length;
  var pos = getPos();

  var start = getStart();
  var end = getEnd();
  var size = end - start;
  var update = shift;

  switch(key){
    case 'a':
      if(!ctrl) break;
      setStart(0);
      setEnd(len);
      break;

    case 'M':
      if(!ctrl) break;

      var s = getCharRel(-1) + getCharRel(0);
      if(/\(\)|\[\]|{}|['"`]{2}/.test(s)) break;

      var d = 0;
      if(/[\)\]}][^\(\)\[\]{}]/.test(s)) d = -1;
      else if(/[^\(\)\[\]{}][\(\[{]/.test(s)) d = 1;
      moveRel(d);

      var depth = 0;
      var start = find((c, dpos) => {
        if(dpos === 0) return -1;
        if(/[\(\[{]/.test(c)) depth--;
        else if(/[\)\]}]/.test(c)) depth++;
        if(depth === -1) return 0;
        return -1;
      });
      if(depth !== -1){ moveRel(-d); break; }

      depth = 0;
      var end = find(c => {
        if(/[\(\[{]/.test(c)) depth++;
        else if(/[\)\]}]/.test(c)) depth--;
        if(depth === -1) return 0;
        return 1;
      });
      if(depth !== -1){ moveRel(-d); break; }

      setStart(start + 1);
      setEnd(end);

      update = 0;
      break;

    case 'ArrowLeft':
      if(!ctrl){
        moveRel(-1, shift);
        break;
      }
      moveAbs(getIdentStart());
      break;

    case 'ArrowRight':
      if(!ctrl){
        moveRel(1, shift);
        break;
      }
      moveAbs(getIdentEnd());
      break;

    case 'ArrowUp':
      var start = getLineStart(1);
      if(start === 0) break;
      moveAbs(start - 1);
      moveAbs(getLineStart(1));
      moveAbs(find((c, dpos) => {
        if(c === '\n' || dpos === pos - start) return 0;
        return 1;
      }));
      break;

    case 'ArrowDown':
      var start = getLineStart(1);
      var end = getLineEnd();
      if(end === len) break;
      moveAbs(end + 1);
      moveAbs(find((c, dpos) => {
        if(c === '\n' || dpos === pos - start) return 0;
        return 1;
      }));
      break;

    case 'Home':
      moveAbs(getLineStart());
      break;

    case 'End':
      moveAbs(getLineEnd());
      break;

    case 'Tab':
      insert(TAB);
      break;

    case 'Backspace':
      if(size !== 0){ remove(size); break; }
      remove(-1);
      break;

    case 'Delete':
      if(size !== 0){ remove(size); break; }
      remove(1);
      break;

    case 'Enter':
      if(pos !== 0 && pos !== len){
        var s = getCharRel(-1) + getCharRel(0);
        if(/\(\)|\[\]|{}|['"`]{2}/.test(s)){
          insert(`\n${TAB}\n`, 0);
          moveRel(1);
          moveAbs(getLineEnd());
          break;
        }
      }
      insert('\n');
      break;
  }

  if(update){
    setStart(Math.min(getStart(), start));
    setEnd(Math.max(getEnd(), end));
  }

  function insert(str, move=1){
    var pos = getPos();
    var tab = getTab();
    var s = ta.value;

    str = str.replace(/\n/g, `\n${tab}`);
    s = s.slice(0, pos) + str + s.slice(pos);
    ta.value = s;

    moveAbs(move ? pos + str.length : pos);
  }

  function remove(size){
    var pos = getPos();
    var s = ta.value;

    if(size < 0) s = s.slice(0, pos + size) + s.slice(pos);
    else s = s.slice(0, pos) + s.slice(pos + size);
    ta.value = s;

    if(size < 0) moveAbs(pos + size);
    else moveAbs(pos);
  }

  function moveRel(dpos, force=0){
    var pos;

    if(dpos < 0){
      pos = getStart();
      if(!force && getEnd() !== pos) pos++;
    }else{
      pos = getEnd();
      if(!force && getStart() !== pos) pos--;
    }

    moveAbs(pos + dpos);
  }

  function moveAbs(pos){
    pos = O.bound(pos, 0, ta.value.length);
    
    O.repeat(2, () => {
      setStart(pos);
      setEnd(pos);
    });
  }

  function setStart(pos){
    ta.selectionStart = pos;
  }

  function setEnd(pos){
    ta.selectionEnd = pos;
  }

  function getTab(){
    var start = getLineStart(1);
    var end = getLineEnd();
    var s = ta.value.slice(start, end);

    var len = s.match(/^\s*/)[0].length / TAB_SIZE | 0;
    return TAB.repeat(len);
  }

  function getIdentStart(){
    var first = 1;
    var found = 0;

    var pos = find(c => {
      if(first){ first = 0; return -1; }
      if(c === null) return -1;
      if(/[0-9a-zA-Z_\$]/.test(c)) found = 1;
      else if(found) return 0;
      return -1;
    });

    if(pos !== 0 && pos !== ta.value.length) pos++;
    return pos;
  }

  function getIdentEnd(){
    var found = 0;

    return find(c => {
      if(c === null) return 1;
      if(/[0-9a-zA-Z_\$]/.test(c)) found = 1;
      else if(found) return 0;
      return 1;
    });
  }

  function getLineStart(force=0){
    var val = ta.value;
    var pos = getPos();
    var first = 1;

    var start = find(c => {
      if(first === 1){first = 0; return -1; }
      if(c === null) return -1;
      if(c === '\n') return 0;
      return -1;
    });

    if(start !== 0) start++;
    if(force) return start;

    if(pos === start){
      var end = getLineEnd();
      var s = val.slice(start, end);
      return start + s.match(/^\s*/)[0].length;
    }

    var s = val.slice(start, pos);
    if(/^\s*$/.test(s)) return start;

    return start + s.match(/^\s*/)[0].length;
  }

  function getLineEnd(){
    return find(c => {
      if(c === null) return 1;
      if(c === '\n') return 0;
      return 1;
    });
  }

  function find(func, minDpos=0){
    var val = ta.value;
    var len = val.length;

    var pos = getPos();
    var dpos = 0;

    while(1){
      var dp = func(val[pos + dpos] || null, dpos, pos + dpos);
      if(dp === 0 && Math.abs(dpos) >= minDpos) break;

      dpos += dp;
      if(pos + dpos < 0){ dpos = -pos; break; }
      if(pos + dpos > len){ dpos = len - pos; break; }
    }

    return pos + dpos;
  }

  function getPos(dir=-1){
    if(dir === -1) return getStart();
    return getEnd();
  }

  function getStart(){
    return ta.selectionStart;
  }

  function getEnd(){
    return ta.selectionEnd;
  }

  function getCharRel(dpos){
    return getCharAbs(getPos() + dpos);
  }

  function getCharAbs(pos){
    var val = ta.value;
    var len = val.length;

    if(pos < 0 || pos >= len) return null;
    return val[pos];
  }
}