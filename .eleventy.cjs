const htmlmin = require('html-minifier');

function requireSafe(path) {
  try {
    return require(path);
  } catch (err) {
    return {};
  }
}

const filtersReady = import('./src/lib/filters.js');
const componentsReady = import('./lib/components.js');

module.exports = function (config) {
  function addFilter(name) {
    config.addNunjucksAsyncFilter(name, async (value, callback) => {
      try {
        const filters = await filtersReady;
        const filter = filters[name];
        const result = await filter(value);
        callback(null, result);
      } catch (err) {
        callback(err);
      }
    });
  }

  function addShortcode(name) {
    config.addNunjucksAsyncShortcode(name, async (props) => {
      const components = await componentsReady;
      const component = components[name];
      return component.render(props).html;
    });
  }

  addShortcode('Schedule');
  addShortcode('StopConnections');
  addShortcode('TripSelect');

  addFilter('gtfsArrivalToString');

  // pass some assets right through
  config.addPassthroughCopy({
    'src/site/assets': true,
    'src/site/icon': true,
    'src/site/manifest.json': true,
    'src/site/css': '.',
  });

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
