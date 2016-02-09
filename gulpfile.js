/* File: gulpfile.js */
'use strict';

// gulp reqs
var gulp       = require('gulp-help')(require('gulp')),
    concat     = require('gulp-concat'),
    connect    = require('gulp-connect-php'),
    debug      = require('gulp-debug'),
    gutil      = require('gulp-util'),
    iife       = require('gulp-iife'),
    jshint     = require('gulp-jshint'),
    livereload = require('gulp-livereload'),
    notify     = require('gulp-notify'),
    sass       = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify     = require('gulp-uglify'),
    wrap       = require('gulp-wrap');

// setup jshint
gulp.task('jshint', 'Checks js syntax', function () {
  return gulp.src(['source/js/**/*.js'])
    .pipe(jshint({
      "node": true,
      "globals": {
        "ActiveXObject": true,
        "alert": true,
        "angular": true,
        "d3": true,
        "document": true,
        "jQuery": true,
        "FileReader": true,
        "fr": true,
        "window": true
      }
    }))
    .pipe(jshint.reporter('jshint-stylish'));
});

// prepare ng.js file
gulp.task('prepare-ng', 'Prepare ng.js file', function () {
  return gulp.src('source/**/*.js')
    .pipe(concat('ng.js'))
    //.pipe(wrap('(function(){\n"use strict";\n<%= contents =%>\n})();'))
    .pipe(iife())
    .pipe(gulp.dest('app/js'))
    .pipe(notify({message: 'Finished preparing ng files'}));
});

// compile js
gulp.task('compile-js', 'Aggregates js files', ['prepare-ng'], function () {
  gulp.src('bower_components/modernizr/modernizr.js')
    .pipe(gulp.dest('app/js'));

  return gulp.src([
      'bower_components/jquery/dist/jquery.js',
      'bower_components/foundation/js/foundation.js',
      'bower_components/angular/angular.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-uuid4/angular-uuid4.js',
      'bower_components/d3/d3.min.js',
      'app/js/ng.js'
      //'source/**/*.js'
    ], {base: 'app/js'})
    .pipe(sourcemaps.init())
    .pipe(debug())
    .pipe(concat('app.js'))
    // uglify if env = production
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/js'))
    .pipe(livereload())
    .pipe(notify({message: 'Finished compiling js files'}));
});

// compile css
gulp.task('compile-css', 'Compiles and concatenates sass files', function () {
  return gulp.src([
      'source/**/*.scss',
      'bower_components/fontawesome/scss/font-awesome.scss'],
    {base: '/'})
    .pipe(sourcemaps.init())
    .pipe(debug())
    .pipe(sass({
      includePaths: [
        'bower_components/foundation/scss',
        'bower_components/fontawesome/scss',
        'source/scss',
        'source/scss/partials'
      ]
    })
      .on('error', sass.logError))
    .pipe(concat('app.css'))
    // uglify if env = production
    .pipe(gutil.env.type === 'production' ? uglify() : gutil.noop())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('app/css'))
    .pipe(livereload())
    .pipe(notify({message: 'Finished compiling scss files'}));
});

// copy font-awesome fonts
gulp.task('copy-fontawesome', 'Copies fontawesome assets', function () {
  return gulp.src('bower_components/fontawesome/fonts/**/*.*')
    .pipe(gulp.dest('app/fonts'))
    .pipe(notify({message: 'Finished copying a fontawesome file'}));
});

// copy custom fonts
gulp.task('copy-custom-fonts', 'Copies custom fonts', function () {
  return gulp.src('source/fonts/**/*.*')
    .pipe(gulp.dest('app/fonts'))
    .pipe(notify({message: 'Finished copying custom font files'}));
});

// copy markup
gulp.task('copy-markup', 'Copies markup templates', function () {
  gulp.src(['source/index.html', 'source/endpoint.php'])
    .pipe(gulp.dest('app'))
    .pipe(livereload())
    .pipe(notify({message: 'Finished copying index.html and php endpoing file'}));
  gulp.src('source/partials/*.html')
    .pipe(gulp.dest('app/partials'))
    .pipe(livereload())
    .pipe(notify({message: 'Finished copying HTML template files'}));
});

// copy images
gulp.task('copy-images', 'Copies images', function () {
  gulp.src('source/images/**/*')
    .pipe(gulp.dest('app/images'))
    .pipe(notify({message: 'Finished copying images'}));
});

// start web server
gulp.task('connect', 'Starts web server', function () {
  connect.server({
    //base: 'app/',
    port: 8000
  });
});

// watch files
gulp.task('watch', 'Watches files for changes', ['build', 'connect'], function () {
  notify({message: 'Gulp started to watch existing files for changes'});
  livereload.listen();
  gulp.watch(['source/**/*.html', 'source/**/*.php'], ['copy-markup']);
  gulp.watch(['source/scss/**/*.scss',
    'bower_components/fontawesome/scss/font-awesome.scss'], ['compile-css']);
  gulp.watch('source/js/**/*.js', ['jshint', 'compile-js']);
  gulp.watch('bower_components/fontawesome/fonts/**/*.*', ['copy-fontawesome']);
  gulp.watch('source/fonts/**/*.*', ['copy-custom-fonts']);
  gulp.watch('source/images/**/*.*', ['copy-images']);
});

// build
gulp.task('build', 'Builds project', ['copy-markup', 'copy-images', 'compile-css', 'jshint', 'compile-js', 'copy-fontawesome', 'copy-custom-fonts']);

// default task
gulp.task('default', 'Defines default task', ['build']);
