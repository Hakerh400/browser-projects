'use strict';

const names = [
  'meadow',
  'lake',
];

const biomes = await loadBiomes(names);

biomes.rand = rand;

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

function rand(ctorOld=null){
  if(names.length === 1)
    return biomes[O.projectToName(names[0])];

  do{
    var name = O.randElem(names);
    var ctor = biomes[O.projectToName(name)];
  }while(ctor === ctorOld);

  return ctor;
}