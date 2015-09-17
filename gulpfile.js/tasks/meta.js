var browserSync  = require('browser-sync');
var config       = require('../config/meta');
var gulp         = require('gulp');
var handleErrors = require('../lib/handleErrors');

gulp.task('meta', function() {
  return gulp.src(config.src)
    .on('error', handleErrors)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
