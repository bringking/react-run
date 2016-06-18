var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');

gulp.task('build:production', function (cb) {
    process.env.NODE_ENV = 'production';
    gulpSequence(['fonts', 'images', 'static'], ['sass', 'webpack:production', 'vendor'], ['gzip'], cb);
});
