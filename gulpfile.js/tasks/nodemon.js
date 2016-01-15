var gulp        = require('gulp'),
    nodemon     = require('nodemon'),
    browserSync = require('browser-sync');

gulp.task('nodemon', function( cb ) {
    var started = false;

    return nodemon({
        script: 'server.js'
    }).on('start', function() {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if ( !started ) {
            cb();
            browserSync.reload();
            started = true;
        }
    });
});