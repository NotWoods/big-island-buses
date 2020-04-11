module.exports = function(config) {
  // pass some assets right through
  config.addPassthroughCopy({
    'src/site/assets': true,
    'src/site/icon': true,
    'src/site/manifest.json': true,
    'src/site/css': '.',
  });

  return {
    pathPrefix: '/big-island-buses/',
    dir: {
      input: 'src/site',
      output: 'big-island-buses',
    },
  };
};
