var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var handleErrors = require('../lib/handleErrors');
var config = require('../config/sass');
var autoprefixer = require('gulp-autoprefixer');
var rev = require('gulp-rev');
var gulpif = require('gulp-if');

gulp.task('sass', function() {
    return gulp.src(config.src)
        .pipe(sourcemaps.init())
        .pipe(sass(config.settings))
        .on('error', handleErrors)
        .pipe(sourcemaps.write())
        .pipe(autoprefixer(config.autoprefixer))
        .pipe(gulpif(process.env.NODE_ENV === "production", rev()))
        .pipe(gulp.dest(config.dest))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./'))
        .pipe(browserSync.reload({stream: true}));
});
