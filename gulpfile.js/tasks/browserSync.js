var browserSync = require('browser-sync');
var gulp = require('gulp');
var config = require('../config/browserSync');

gulp.task('browserSync', ['nodemon'], function() {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        port: 8000
    });
});
