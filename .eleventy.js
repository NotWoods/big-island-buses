module.exports = function(config) {
  // pass some assets right through
  config.addPassthroughCopy({
    'src/site/assets': true,
    'src/site/icon': true,
    'src/site/roboto': true,
    'src/site/manifest.json': true,
    'src/site/css': '.',
  });

  return {
    dir: {
      input: 'src/site',
      output: 'dist',
    },
  };
};
