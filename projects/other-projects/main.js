'use strict';

window.setTimeout(main);

function main(){
  var subProject = O.urlParam('sub-project');

  if(subProject === null)
    displayProjects();
  else
    loadProject(subProject);
}

function displayProjects(){
  O.rfLocal('sub-projects.txt', (status, data) => {
    if(status !== 200)
      return O.error('Cannot load sub-projects list.');

    O.title(O.projectToName(O.project));
    var menu = O.ce(O.body, 'div');

    O.sortAsc(O.sanl(data)).forEach((subProject, index) => {
      if(index !== 0) O.ceBr(menu);
      O.ceLink(menu, O.projectToName(subProject), `/?project=${O.project}&sub-project=${subProject}`);
    });
  });
}

function loadProject(subProject){
  require(`./sub-projects/${subProject}/main`);
}