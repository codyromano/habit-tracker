'use strict';

var gulp     = require('gulp'),
    uglify   = require('gulp-uglify'),
    concat   = require('gulp-concat'),
    app      = require('./main');

app.set('port', process.env.PORT || 8081);

gulp.task('minify', function () {

  /**
  * @todo Process and concatenate JSX files as well as plain JS 
  */
   return gulp.src([
        'public/publicConfig.js',

        /* TODO: Remove jQuery. I'm only using it for AJAX calls in two 
        places; the library is unnecessarily expensive */
        'public/thirdparty/jquery-2.1.4.min.js',
        'public/thirdparty/fastclick.js',
        'public/thirdparty/es5-shim.min.js',
        'public/thirdparty/es5-sham.min.js',
        'public/thirdparty/console-polyfill.js',
        'public/thirdparty/react.js',
        'public/thirdparty/JSXTransformer.js',
        'public/publicConfig.js',
        'public/utils/U.js',
        'public/utils/PubSub.js',
        'public/stores/UserStore.js',
        'public/stores/FBUserStore.js',
        'public/stores/HabitStore.js',
        'public/stores/MessageStore.js'
        ])
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
