'use strict';

var gulp                = require('gulp'),
    plugins             = require('gulp-load-plugins')(),
    uglify              = require('gulp-uglify'),
    concat              = require('gulp-concat'),
    app                 = require('./main');

var env = (process.env.NODE_ENV=='dev') ? 'dev' : 'production';

/* These files need to be listed out for now because of
dependency order. TODO: Implement browserify so that dependencies
are handled in a cleaner way and listing files is not necessary. */

var jsxFiles = [
  'public/components/HabitActionMenu.js',
  'public/components/Habit.js',
  'public/components/NewHabitForm.js',
  'public/components/Messages.js',
  'public/components/ProfileIcon.js',
  'public/components/HabitHeader.js',
  'public/components/LandingPage.js',
  'public/components/HabitApp.js'
];

var jsFiles = [
  'public/publicConfig.js',
  'public/thirdparty/jquery-2.1.4.min.js',
  'public/thirdparty/fastclick.js',
  'public/thirdparty/es5-shim.min.js',
  'public/thirdparty/es5-sham.min.js',
  'public/thirdparty/react.js',
  'public/publicConfig.js',
  'public/utils/Ajax.js',
  'public/utils/U.js',
  'public/utils/PubSub.js',
  'public/stores/UserStore.js',
  'public/stores/FBUserStore.js',
  'public/stores/HabitStore.js',
  'public/stores/MessageStore.js'
];

app.set('port', process.env.PORT || 8081);

gulp.task('start-server', function() {
  var server = app.listen(app.get('port'), function() {
    console.log('Express server listening on port %s', 
      server.address().port);
  });
  return server; 
});

gulp.task('minify-js', function() {
  if (env === 'production') {
    gulp.src(jsFiles)
    .pipe(concat('all-non-jsx.js'))
    .pipe(plugins.babel())
    .pipe(uglify())
    .pipe(gulp.dest('./public/'))
    .pipe(plugins.livereload());

  /* Tell Gulp not to minify the JSX during development
  TODO: There's probably a better built-in way to differentiate
  between dev and prod tasks, but I'm still getting familiar with Gulp. */
  } else if (env === 'dev') {
    gulp.src(jsFiles)
    .pipe(plugins.babel())
    .pipe(concat('all-non-jsx.js'))
    .pipe(gulp.dest('./public/'))
    .pipe(plugins.livereload());
  }

  if (env === 'production') {
    gulp.src(jsxFiles)
    .pipe(plugins.babel())
    .pipe(concat('all-jsx.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./public/'))
    .pipe(plugins.livereload());

  } else if (env === 'dev') {
    gulp.src(jsxFiles)
    .pipe(concat('all-jsx.js'))
    .pipe(plugins.babel())
    .pipe(gulp.dest('./public/'))
    .pipe(plugins.livereload());
  }
});

gulp.task('compile-sass', function() {
  return gulp.src('public/styles/main.scss')
    .pipe(plugins.sass({
      sourceComments: 'normal',
      indentedSyntax: true
    }))
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
