var gulp = require('gulp');
var zip = require('gulp-zip');
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');

gulp.task('deploy', function() {

    var conn = ftp.create({
        host: 'ftp.triggerglobal.com',
        user: 'rincon',
        pass: 'Zaq1Xsw2',
        parallel: 10,
        log: gutil.log
    });

    return gulp.src('public/**/*')
        .pipe(zip('latest.zip'))
        .pipe(conn.dest('/from_Rincon'));
});
