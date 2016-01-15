var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:development', function( cb ) {
    gulpSequence(['fonts', 'iconFont', 'images'], ['sass', 'webpack:development', 'meta', 'html', 'vendor'], ['watch', 'browserSync'], cb);
});
