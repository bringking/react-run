var gulp = require('gulp');
var del = require('del');
var config = require('../config');
var htmlConfig = require('../config/html');

gulp.task('clean', function (cb) {
    return del([
        config.publicAssets,
        htmlConfig.dest
    ]);
});
