var gulp    = require('gulp'),
    nodemon = require('nodemon');

gulp.task('nodemon', function( cb ) {
    return nodemon({
        script: 'server.js'
    }).once('start', cb);
});