/* global rm, mkdir, cp, exec, cat */
require('shelljs/global');
var _ = require('lodash');

var gulp = require('gulp');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var rename = require('gulp-rename');
var gutil = require('gulp-util');
var runSequence = require('run-sequence');
var testem = require('gulp-testem');
var webpack = require('webpack');
var webpackConfig = require('./webpack.config');

gulp.task('example', function(callback) {
  webpack(webpackConfig, function(err, stats) {
      if(err) throw new gutil.PluginError('webpack', err);
      gutil.log('[webpack]', stats.toString({}));
      callback();
    });
});

gulp.task('pack-for-tests', function(callback) {
  var config = _.clone(webpackConfig);
  _.assign(config, {
    entry: './test/entry.js',
    output: {
      path: __dirname + '/test',
      filename: 'bundle.js'
    }
  });
  webpack(config, function(err, stats) {
      if(err) throw new gutil.PluginError('webpack', err);
      gutil.log('[webpack]', stats.toString({}));
      callback();
    });
});

gulp.task('pack-for-ghpages', function(callback) {
  webpack(webpackConfig, function(err, stats) {
    if(err) throw new gutil.PluginError('webpack', err);
    gutil.log('[webpack]', stats.toString({}));
    callback();
  });
});

gulp.task('style-for-ghpages', function() {
  return gulp.src('example/less/example.less')
    .pipe(less({
      paths: ['./example/less/', '.']
    }))
    .pipe(rename('example.css'))
    .pipe(gulp.dest('example'));
});

gulp.task('tideline', function() {
  return gulp.src('js/index.js')
    .pipe(browserify({
      bundleExternal: false,
      standalone: 'tideline'
    }))
    .pipe(rename('tideline.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('preprocess', function() {
  return gulp.src('plugins/data/preprocess/index.js')
    .pipe(browserify({
      bundleExternal: false,
      standalone: 'tideline.preprocess'
    }))
    .pipe(rename('tideline-preprocess.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('watson', function() {
  return gulp.src('plugins/data/watson/index.js')
    .pipe(browserify({
      bundleExternal: false,
      standalone: 'tideline.watson'
    }))
    .pipe(rename('tideline-watson.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('blip', function() {
  return gulp.src('plugins/blip/index.js')
    .pipe(browserify({
      bundleExternal: false,
      standalone: 'tideline.blip'
    }))
    .pipe(rename('tideline-blip.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('browserify-tests', function() {
  return gulp.src('test/index.js')
    .pipe(browserify())
    .pipe(rename('test.js'))
    .pipe(gulp.dest('test'));
});

gulp.task('testem', function () {
  gulp.src([''])
    .pipe(testem({
      configFile: 'testem.json'
    }));
});

gulp.task('style', function() {
  return gulp.src('css/tideline.less')
    .pipe(less())
    .pipe(rename('tideline.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('default', function(cb) {
  console.log('Cleaning output directory...');
  rm('-rf', 'dist');
  mkdir('-p', 'dist');
  runSequence(
    ['tideline', 'preprocess', 'watson', 'blip', 'style'],
  cb);
});

gulp.task('test', function(cb) {
  runSequence(
    ['pack-for-tests', 'browserify-tests'],
    'testem',
  cb);
});

gulp.task('ghpages', function(cb) {
  runSequence(
    ['pack-for-ghpages', 'style-for-ghpages'],
  cb);
});