'use strict';

window.setTimeout(main);

function main(){
  var url = O.urlParam('url');
  if(url === null) return O.error('Missing url parameter');

  window.location.href = url;
}