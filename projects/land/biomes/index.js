'use strict';

const biomes = await loadBiomes([
  'meadow',
]);

module.exports = biomes;

async function loadBiomes(names){
  var biomes = O.obj();

  for(var i = 0; i !== names.length; i++){
    var fileName = names[i];
    var className = O.projectToName(fileName);

    biomes[className] = await require(`./${fileName}`);
  }

  return biomes;
}