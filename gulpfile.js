var gulp = require('gulp');
//var gulpif = require('gulp-if');
//var fs = require('graceful-fs');

var sources = ['ngBobril.js'];

var dist = '.';

gulp.task('uglify', function() {
  var uglify = require('gulp-uglify');
  var rename = require('gulp-rename');

  return gulp.src(sources)
    .pipe(uglify({ compress: { unsafe:true, pure_funcs: [ 'assert' ], global_defs: { DEBUG: false } } }))
	.pipe(rename(function (path) {
        path.basename += ".min";
    }))
    .pipe(gulp.dest(dist));
});


gulp.task('default', ['uglify']);
