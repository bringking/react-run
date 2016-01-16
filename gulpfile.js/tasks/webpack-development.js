var assign      = require('object-assign'),
    config      = require('../config/webpack')('development'),
    gulp        = require('gulp'),
    logger      = require('../lib/compileLogger'),
    webpack     = require('webpack'),
    browserSync = require('browser-sync');

gulp.task('webpack:development', function( callback ) {
    var built = false;

    webpack(config).watch(200, function( err, stats ) {
        logger(err, stats);
        browserSync.reload();
        // On the initial compile, let gulp know the task is done
        if ( !built ) {
            built = true;
            callback()
        }
    })
});
