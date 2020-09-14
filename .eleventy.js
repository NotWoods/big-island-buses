const htmlmin = require('html-minifier');

let filters = {};
try {
  filters = require('./lib/filters.js');
} catch (err) {}

module.exports = function (config) {
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
