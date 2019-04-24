'use strict';

const textures = {
  hud: './textures/hud.png',
  sky: './textures/sky.png',
  dirt: './textures/dirt.png',
  stone: './textures/stone.png',
  man: './textures/man.png',
};

class Material{
  constructor(tex){
    this.tex = tex;
  }

  static async init(genTexFunc, procTexFunc){
    for(const texture of O.keys(textures)){
      const glTex = genTexFunc();
      const tex = await Material.loadTexture(textures[texture], glTex, procTexFunc);
      Material[texture] = new Material(tex);
    }
  }

  static loadTexture(pth, glTex, procTexFunc){
    return new Promise(res => {
      const tex = glTex;
      const img = new Image();

      img.onload = () => {
        procTexFunc(tex, img);
        res(tex);
      };

      img.src = O.urlTime(`/projects/${O.project}/${pth}`);
    });
  }
};

module.exports = Material;