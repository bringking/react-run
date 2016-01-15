var config = require('./');

module.exports = {
  watch: config.sourceDirectory + '/views/**/*.html',
  src: config.sourceDirectory + '/views/**/*.html',
  dest: config.publicDirectory
};