var gulp = require('gulp');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var fs = require('fs');
var _ = require('lodash');
var template = require('gulp-template');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var clean = require('gulp-clean');

var pkg = require('./package.json');
var config = {
  DEMO: process.env.DEMO || true,
  DEMO_DIR: process.env.DEMO_DIR || 'demo/sample'
};
process.env.DEMO_ENDPOINT = 'build/' + pkg.version + '/demo';
config.DEMO_ENDPOINT = process.env.DEMO_ENDPOINT;
var jshintrc = JSON.parse(fs.readFileSync('.jshintrc'));

gulp.task('jshint-app', function() {
  gulp.src('app/**/*.js')
    .pipe(jshint(jshintrc))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint-test', function() {
  gulp.src('test/**/*.js')
    .pipe(jshint(_.extend(jshintrc, {
      newcap: false,
      undef: false,
      expr: true
    })))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint', function() {
  gulp.run('jshint-app', 'jshint-test');
});

gulp.task('jshint-watch', function(){
  gulp.run('jshint');

  gulp.watch('app/**/*.js', function(event) {
    gulp.run('jshint-app');
  });

  gulp.watch('test/**/*.js', function(event) {
    gulp.run('jshint-test');
  });

  console.log('Watching files for changes...');
});

gulp.task('scripts-browserify', function(cb) {
  gulp.src('app/app.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/tmp'))
    .on('end', cb);
});

gulp.task('scripts-config', function(cb) {
  gulp.src('app/config.js')
    .pipe(template({
      process: {env: process.env},
      pkg: pkg
    }))
    .pipe(gulp.dest('dist/tmp'))
    .on('end', cb);
});

gulp.task('scripts', ['scripts-browserify', 'scripts-config'], function(cb) {
  gulp.src([
    'bower_components/react/react.js',
    'bower_components/director/build/director.js',
    'bower_components/lodash/dist/lodash.js',
    'bower_components/bows/dist/bows.js',
    'bower_components/jquery/jquery.js',
    'dist/tmp/config.js',
    'dist/tmp/app.js',
    'app/start.js'
  ]).pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/build/' + pkg.version))
    .on('end', cb);
});

gulp.task('styles', function(cb) {
  gulp.src('app/style.less')
    .pipe(less())
    .pipe(concat('all.css'))
    .pipe(cssmin({keepSpecialComments: 0}))
    .pipe(gulp.dest('dist/build/' + pkg.version))
    .on('end', cb);
});

gulp.task('index', function(cb) {
  gulp.src('app/index.html')
    .pipe(template({
      production: true,
      pkg: pkg
    }))
    .pipe(gulp.dest('dist'))
    .on('end', cb);
});

gulp.task('demo', function(cb) {
  if (config.DEMO) {
    gulp.src(config.DEMO_DIR + '/**')
      .pipe(gulp.dest('dist/' + config.DEMO_ENDPOINT))
      .on('end', cb);
  }
  else {
    cb();
  }
});

gulp.task('clean', function(cb) {
  gulp.src('dist', {read: false})
    .pipe(clean())
    .on('end', cb);
});

gulp.task('clean-tmp', function(cb) {
  gulp.src('dist/tmp', {read: false})
    .pipe(clean())
    .on('end', cb);
});

gulp.task('build', function() {
  gulp.run('clean', function() {
    gulp.run('scripts', 'styles', 'index', 'demo', function(err) {
      gulp.run('clean-tmp', function(err) {
        // NOTE: this callback does nothing,
        // but is a temporary fix to the following bug
        // https://github.com/gulpjs/gulp/issues/139
      });
    });
  });  
});

gulp.task('before-tests', function(cb) {
  gulp.src('test/unit/**/*.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(concat('tests.js'))
    .pipe(gulp.dest('tmp/test'))
    .on('end', cb);
});

gulp.task('default', function() {
  gulp.run('build');
});