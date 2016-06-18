var config = require('./');

module.exports = {
  src: config.sourceAssets + '/static/**/*',
  dest: config.publicAssets + '/'
};
