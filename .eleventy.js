const htmlmin = require('html-minifier');

function requireSafe(path) {
  try {
    return require(path);
  } catch (err) {
    return {};
  }
}

const filters = requireSafe('./lib/filters.js');
const components = requireSafe('./lib/components.js');

module.exports = function (config) {
  for (const [name, component] of Object.entries(components)) {
    config.addShortcode(name, (props) => {
      return component.render(props).html;
    });
  }

  // pass some assets right through
  config.addPassthroughCopy({
    'src/site/assets': true,
    'src/site/icon': true,
    'src/site/manifest.json': true,
    'src/site/css': '.',
  });

  config.addFilter('gtfsArrivalToString', filters.gtfsArrivalToString);

  /*config.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseWhitespace: true,
        removeComments: true,
        useShortDoctype: true,
      })
    } else {
      return content;
    }
  })*/

  return {
    pathPrefix: '/big-island-buses/',
    dir: {
      input: 'src/site',
      output: 'big-island-buses',
    },
  };
};
