var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:development', function( cb ) {
    gulpSequence(['fonts', 'images'], ['sass', 'webpack:development', 'vendor'], ['watch', 'browserSync'], cb);
});
