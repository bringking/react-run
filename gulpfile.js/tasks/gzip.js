var gulp = require('gulp');
var gzip = require('gulp-gzip');

gulp.task('gzip', function() {
    return gulp.src(["./public/**/*.+(js|css|svg|otf|ttf|eot)"])
        .pipe(gzip())
        .pipe(gulp.dest("./public"));
});
