var assign = require('object-assign')
var config = require('../config/webpack')('development')
var gulp = require('gulp')
var logger = require('../lib/compileLogger')
var webpack = require('webpack')

gulp.task('webpack:development', function( callback ) {
    /*var built = false

    webpack(config).watch(200, function( err, stats ) {
        logger(err, stats)
        // On the initial compile, let gulp know the task is done
        if ( !built ) {
            built = true;
            callback()
        }
    })*/
    webpack(config, function(err, stats) {
        logger(err, stats)
        callback()
    })
})
