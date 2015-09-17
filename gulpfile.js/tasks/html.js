var browserSync  = require('browser-sync');
var config       = require('../config/html');
var gulp         = require('gulp');
var handleErrors = require('../lib/handleErrors');

gulp.task('html', function() {
  return gulp.src(config.src)
    .on('error', handleErrors)
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({stream:true}));
});
