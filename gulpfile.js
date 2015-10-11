'use strict';

var gulp                = require('gulp'),
    plugins             = require('gulp-load-plugins')(),
    uglify              = require('gulp-uglify'),
    concat              = require('gulp-concat'),
    app                 = require('./main');

app.set('port', process.env.PORT || 8081);

gulp.task('start-server', function() {
  var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port %s', 
      server.address().port);
  });
  return server; 
});

gulp.task('minify-js', function() {
   gulp.src([
    'public/publicConfig.js',

    /* TODO: Remove jQuery. I'm only using it for AJAX calls in two 
    places; the library is unnecessarily expensive */
    'public/thirdparty/jquery-2.1.4.min.js',
    'public/thirdparty/fastclick.js',
    'public/thirdparty/es5-shim.min.js',
    'public/thirdparty/es5-sham.min.js',
    'public/thirdparty/console-polyfill.js',
    'public/thirdparty/react.js',
    'public/publicConfig.js',
    'public/utils/U.js',
    'public/utils/PubSub.js',
    'public/stores/UserStore.js',
    'public/stores/FBUserStore.js',
    'public/stores/HabitStore.js',
    'public/stores/MessageStore.js',
    ])
    .pipe(concat('all-non-jsx.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/'))
    .pipe(plugins.livereload());

  gulp.src([
    'public/components/HabitActionMenu.js',
    'public/components/Habit.js',
    'public/components/NewHabitForm.js',
    'public/components/Messages.js',
    'public/components/HabitApp.js'
  ])
  .pipe(concat('all-jsx.js'))
  .pipe(plugins.babel())
  .pipe(uglify())
  .pipe(gulp.dest('./public/'))
  .pipe(plugins.livereload());
});

gulp.task('compile-sass', function() {
  return gulp.src('public/styles/main.scss')
    .pipe(plugins.sass())
    .pipe(plugins.minifyCss())
    .pipe(gulp.dest('./public/styles/'))
    .pipe(plugins.livereload());
});

gulp.task('watch', function() {
  plugins.livereload.listen();
  gulp.watch(['public/**/*.js',
    '!public/all-non-jsx.js',
    '!public/all-jsx.js'], ['minify-js']);
  gulp.watch('public/styles/**.scss', ['compile-sass']);
});

gulp.task('default', ['start-server', 'minify-js', 'compile-sass', 'watch']);
