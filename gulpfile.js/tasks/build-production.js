var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:production', function( cb ) {
    //process.env.NODE_ENV = 'production';
    //TODO this is turned off to show the user meaningful React errors in the console
    gulpSequence(['fonts', 'iconFont', 'images'], ['sass', 'webpack:production', 'meta', 'vendor'], ['html', 'gzip'], cb);
});
