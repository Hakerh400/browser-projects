'use strict';

const textures = {
  hud: './textures/hud.png',
  sky: './textures/sky.png',
  dirt: './textures/dirt.png',
  stone: './textures/stone.png',
  man: './textures/man.png',
};

let gl;

class Material{
  constructor(tex){
    this.tex = tex;
  }

  static async init(glCtx){
    gl = glCtx;

    for(const texture of O.keys(textures)){
      const tex = await Material.loadTexture(textures[texture]);;
      Material[texture] = new Material(tex);
    }
  }

  static loadTexture(pth){
    return new Promise(res => {
      const texture = gl.createTexture();
      const img = new Image();

      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);

        res(texture);
      };

      img.src = O.urlTime(`/projects/${O.project}/${pth}`);
    });
  }
};

module.exports = Material;