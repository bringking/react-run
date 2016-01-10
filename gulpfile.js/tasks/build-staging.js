var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:staging', function( cb ) {
    process.env.NODE_ENV = 'staging';
    gulpSequence('karma', 'clean', ['fonts', 'iconFont', 'images'], ['sass', 'webpack:production', 'meta', 'vendor'], 'html', 'rev', cb);
});
