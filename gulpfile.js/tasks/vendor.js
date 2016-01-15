var browserSync = require('browser-sync');
var gulp = require('gulp');
var paths = require('../config');
var jsSrc = paths.sourceAssets + '/javascripts/vendor/**/*.js';
var jsDest = paths.publicAssets + '/javascripts/';
var uglify = require('gulp-uglify');

gulp.task('vendor', function() {
    return gulp.src(jsSrc)
        .pipe(uglify())
        .pipe(gulp.dest(jsDest))
        .pipe(browserSync.reload({stream: true}));
});
