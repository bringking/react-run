var gulp = require('gulp');
var images = require('../config/images');
var sass = require('../config/sass');
var fonts = require('../config/fonts');
var watch = require('gulp-watch');

gulp.task('watch', ['browserSync'], function() {
    watch(images.src, function() {
        gulp.start('images');
    });
    watch(sass.src, function() {
        gulp.start('sass');
    });
    watch(fonts.src, function() {
        gulp.start('fonts');
    });
});
