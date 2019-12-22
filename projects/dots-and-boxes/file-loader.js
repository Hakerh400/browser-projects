'use strict';

const load = () => new Promise((res, rej) => {
  const fileInput = O.doc.createElement('input');
  fileInput.type = 'file';

  const onInput = () => {
    const {files} = fileInput;
    if(files.length === 0) return res(null);
    if(files.length > 1) return rej('multipleFiles');

    const file = files[0];
    const reader = new FileReader();

    O.ael(reader, 'load', evt => {
      const {result} = reader;
      const str = result.slice(result.indexOf(',') + 1);

      res(O.Buffer.from(str, 'base64'));
    });

    O.ael(reader, 'error', evt => {
      rej('cannotLoadFile');
    });

    reader.readAsDataURL(file);
  };

  const onFocus = () => {
    O.rel('focus', onFocus);

    const t = O.now;

    const check = () => {
      const {files} = fileInput;

      if(files.length !== 0) return onInput();
      if(O.now - t > 1e3) return ret();

      O.raf(check);
    };

    O.raf(check);
  };

  O.ael('focus', onFocus);

  fileInput.click();
});

module.exports = {
  load,
};