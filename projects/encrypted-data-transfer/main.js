'use strict';

const REMOTE = 0;

const URL = REMOTE ? 'https://e8kkzbh.herokuapp.com/'
                   : 'http://localhost:5000/';

window.setTimeout(main);

async function main(){
  var {data, err} = await send('test___');
  if(err) return O.fatal(err);
  
  O.body.innerHTML = data.join('<br>');
}

function send(data){
  return new Promise(res => {
    var xhr = new window.XMLHttpRequest();

    xhr.onreadystatechange = () => {
      if(xhr.readyState === 4){
        if(xhr.status !== 200)
          return fatal(`Status code: ${xhr.status}`);

        try{ var json = JSON.parse(xhr.responseText); }
        catch(error){ return fatal(err); }

        res(json);
      }
    };

    xhr.open('POST', URL);
    xhr.send(JSON.stringify(data));

    function fatal(err){
      O.error(err);
    }
  });
}