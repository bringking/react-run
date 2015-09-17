var config = require('./')

module.exports = {
  watch: config.sourceDirectory + '/meta/**/*.*',
  src: config.sourceDirectory + '/meta/**/*.*',
  dest: config.publicAssets + '/meta'
}