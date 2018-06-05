const compiler = require('vue-template-compiler');

const finalDependencies = {};
const addDependencies = (dependencies, isScript) => {
  let objDependencies = {};
  if (Array.isArray(dependencies)) {
    dependencies.forEach((dependency) => {
      objDependencies[dependency] = {};
    });
  } else {
    objDependencies = dependencies;
  }
  Object.keys(objDependencies).forEach((dependency) => {
    finalDependencies[dependency] = objDependencies[dependency];
    finalDependencies[dependency].isScript = isScript;
  });
};

module.exports = function(src, options = {}) {
  options.useContent = true;
  const { script, styles } = compiler.parseComponent(src, { pad: 'line' });
  // it must be required here, otherwise, it'll be a cyclic dependency
  const precinct = require('../../precinct');
  if (script) {
    const dependencies = precinct(script.content, options);
    addDependencies(dependencies, true);
  }
  if (styles) {
    styles.map(style => addDependencies(precinct(style.content, { type: style.lang || 'scss' }), false ));
  }

  return finalDependencies;
};
