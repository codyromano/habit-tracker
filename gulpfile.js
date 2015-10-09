'use strict';

var gulp     = require('gulp'),
    uglify   = require('gulp-uglify'),
    concat   = require('gulp-concat'),
    app      = require('./main');

app.set('port', process.env.PORT || 8081);

gulp.task('minify', function () {
  return gulp.src('public/*.js')
    .pipe(concat('all-non-jsx.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/'));
});

gulp.task('startServer', function() {
  var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port %s', 
      server.address().port);
  });
  return server; 
});

gulp.task('default', ['minify', 'startServer']);
