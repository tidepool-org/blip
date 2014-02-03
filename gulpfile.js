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
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var es = require('event-stream');
var runSequence = require('run-sequence');

var pkg = require('./package.json');
var files = require('./files');
process.env.DEMO_DIR = process.env.DEMO_DIR || 'demo/sample';
process.env.FONTS_ENDPOINT = 'build/' + pkg.version + '/fonts';
process.env.IMAGES_ENDPOINT = 'build/' + pkg.version + '/images';
process.env.DEMO_ENDPOINT = 'build/' + pkg.version + '/demo';
var jshintrc = JSON.parse(fs.readFileSync('.jshintrc'));

gulp.task('jshint-app', function() {
  return gulp.src('app/**/*.js')
    .pipe(jshint(jshintrc))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint-test', function() {
  return gulp.src('test/**/*.js')
    .pipe(jshint(_.extend(jshintrc, {
      newcap: false,
      undef: false,
      expr: true
    })))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint', ['jshint-app', 'jshint-test']);

gulp.task('jshint-watch', ['jshint'], function(cb){
  gulp.watch('app/**/*.js', ['jshint-app']);

  gulp.watch('test/**/*.js', ['jshint-test']);

  console.log('Watching files for changes...');

  return cb();
});

gulp.task('scripts-browserify', function() {
  return gulp.src('app/app.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/tmp'));
});

gulp.task('scripts-config', function() {
  return gulp.src('app/config.js')
    .pipe(template({
      process: {env: process.env},
      pkg: pkg
    }))
    .pipe(gulp.dest('dist/tmp'));
});

gulp.task('scripts', ['scripts-browserify', 'scripts-config'], function() {
  return gulp.src([].concat(files.js.vendor, [
    'dist/tmp/config.js',
    'dist/tmp/app.js',
    'app/start.js'
  ]))
    .pipe(concat('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist/build/' + pkg.version));
});

gulp.task('styles', function() {
  return gulp.src('app/style.less')
    .pipe(less())
    .pipe(concat('all.css'))
    .pipe(cssmin({keepSpecialComments: 0}))
    .pipe(gulp.dest('dist/build/' + pkg.version));
});

gulp.task('index', function() {
  return gulp.src('app/index.html')
    .pipe(template({
      production: true,
      pkg: pkg
    }))
    .pipe(gulp.dest('dist'));
});

gulp.task('fonts', function() {
  return gulp.src('app/core/fonts/**')
    .pipe(gulp.dest('dist/' + process.env.FONTS_ENDPOINT));
});

gulp.task('images', function () {
  var imageStreams = _.map(files.images, function(image) {
    var src = image.dir + '/**';
    var dest = 'dist/' + process.env.IMAGES_ENDPOINT + '/' + image.endpoint;

    return gulp.src(src)
      .pipe(imagemin())
      .pipe(gulp.dest(dest));
  });

  return es.concat.apply(es, imageStreams);
});

gulp.task('demo', function(cb) {
  if (process.env.DEMO) {
    return gulp.src(process.env.DEMO_DIR + '/**')
      .pipe(gulp.dest('dist/' + process.env.DEMO_ENDPOINT));
  }
  
  return cb();
});

gulp.task('clean', function() {
  return gulp.src('dist', {read: false})
    .pipe(clean());
});

gulp.task('clean-tmp', function() {
  return gulp.src('dist/tmp', {read: false})
    .pipe(clean());
});

gulp.task('build', function(cb) {
  runSequence(
    'clean',
    ['scripts', 'styles', 'index', 'fonts', 'images', 'demo'],
    'clean-tmp',
  cb);
});

gulp.task('before-tests-vendor', function() {
  return gulp.src(files.js.vendor)
    .pipe(gulp.dest('tmp/test/vendor'));
});

gulp.task('before-tests-unit', function() {
  return gulp.src('test/unit/**/*.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(gulp.dest('tmp/test/unit'));
});

gulp.task('before-tests', ['before-tests-vendor', 'before-tests-unit']);

gulp.task('default', ['build']);