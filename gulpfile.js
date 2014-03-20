var fs = require('fs');
var util = require('util');
var _ = require('lodash');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var template = require('gulp-template');
var uglify = require('gulp-uglify');
var cssmin = require('gulp-minify-css');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var es = require('event-stream');
var runSequence = require('run-sequence');
var jsonToObject = require('./lib/gulp-json2obj');
var expandFiles = require('simple-glob');
var mkdirp = require('mkdirp');

var pkg = require('./package.json');
var files = require('./files');
process.env.MOCK_DATA_DIR = process.env.MOCK_DATA_DIR || 'data/sample';
process.env.FONTS_ENDPOINT = 'build/' + pkg.version + '/fonts';
process.env.IMAGES_ENDPOINT = 'build/' + pkg.version + '/images';
var jshintrc = JSON.parse(fs.readFileSync('.jshintrc'));
var testem = require('./testem.json');

gulp.task('jshint-app', function() {
  return gulp.src(['app/**/*.js', 'mock/**/*.js'])
    .pipe(jshint(jshintrc))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint-test', function() {
  return gulp.src('test/**/*.js')
    .pipe(jshint(_.extend({}, jshintrc, {
      newcap: false,
      undef: false,
      expr: true
    })))
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('jshint', ['jshint-app', 'jshint-test']);

gulp.task('jshint-watch', ['jshint'], function(cb){
  gulp.watch(['app/**/*.js', 'mock/**/*.js'], ['jshint-app']);

  gulp.watch('test/**/*.js', ['jshint-test']);

  console.log('Watching files for changes...');

  return cb();
});

gulp.task('scripts-config', function() {
  return gulp.src('app/config.js')
    .pipe(template({
      process: {env: process.env},
      pkg: pkg
    }))
    .pipe(uglify())
    .pipe(gulp.dest('dist/build/' + pkg.version));
});

gulp.task('scripts-browserify', function() {
  return gulp.src('app/app.js')
    .pipe(browserify({
      transform: ['reactify']
    }))
    .pipe(concat('app.js'))
    .pipe(gulp.dest('dist/tmp'));
});

gulp.task('scripts-mock', function(cb) {
  if (process.env.MOCK) {
    // {read: false} necessary for standalone option, see:
    // https://github.com/deepak1556/gulp-browserify/issues/9
    return gulp.src('mock/index.js', {read: false})
      .pipe(browserify({standalone: 'mock'}))
      .pipe(concat('mock.js'))
      .pipe(gulp.dest('dist/tmp'));
  }
  else {
    cb();
  }
});

gulp.task('scripts-mock-data', function(cb) {
  if (process.env.MOCK) {
    var data = {};

    gulp.src(process.env.MOCK_DATA_DIR + '/**/*.json')
      .pipe(jsonToObject(data))
      .on('end', function() {
        var contents = 'window.data = ';
        contents = contents + util.inspect(data, {depth: null});
        contents = contents + ';';
        var dir = 'dist/tmp';
        mkdirp.sync(dir);
        fs.writeFile(dir + '/data.js', contents, cb);
      });
  }
  else {
    cb();
  }
});

gulp.task('scripts-all', [
  'scripts-browserify',
  'scripts-config',
  'scripts-mock',
  'scripts-mock-data'
], function(cb) {
  var vendorPaths = segmentVendorPaths(files.js.vendor);

  // Vendor files that need minifying, and the app files
  var src = vendorPaths.noMin;
  if (process.env.MOCK) {
    src = src.concat([
      'dist/tmp/data.js',
      'dist/tmp/mock.js'
    ]);
  }
  src = src.concat([
    'app/tidepoolplatform.js',
    'dist/tmp/app.js',
    'app/start.js'
  ]);

  var vendorAlreadyMinified = gulp.src(vendorPaths.hasMin);
  var restBeingMinified = gulp.src(src).pipe(uglify());

  return es.concat.apply(es, [vendorAlreadyMinified, restBeingMinified])
    .pipe(concat('all.js'))
    .pipe(gulp.dest('dist/build/' + pkg.version));
});

// Build paths to vendor dist files, and separate between
// those that already have a minified dist and those that don't
function segmentVendorPaths(vendors) {
  var noMin = _.filter(vendors, function(item) {
    return !item.distMin;
  });
  noMin = _.map(noMin, makeVendorPath.bind(null, 'dist'));

  var hasMin = _.filter(vendors, function(item) {
    return item.distMin;
  });
  hasMin = _.map(hasMin, makeVendorPath.bind(null, 'distMin'));

  return {noMin: noMin, hasMin: hasMin};
}

function makeVendorPath(build, vendor) {
  return vendor.dir + '/' + vendor[build];
}

gulp.task('scripts', ['scripts-config', 'scripts-all']);

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
      pkg: pkg,
      mock: process.env.MOCK
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

gulp.task('svg', function () {
  var imageStreams = _.map(files.svg, function(image) {
    var src = image.dir + '/**';
    var dest = 'dist/' + process.env.IMAGES_ENDPOINT + '/' + image.endpoint;

    return gulp.src(src)
      .pipe(gulp.dest(dest));
  });

  return es.concat.apply(es, imageStreams);
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
    ['scripts', 'styles', 'index', 'fonts', 'images', 'svg'],
    'clean-tmp',
  cb);
});

gulp.task('clean-test', function(){
  return gulp.src('tmp/test').pipe(clean());
});

gulp.task('before-tests-mocha', function() {
  return gulp.src([
      'node_modules/mocha/mocha.css',
      'node_modules/mocha/mocha.js'
    ])
    .pipe(gulp.dest('tmp/test'));
});

gulp.task('before-tests-vendor', function() {
  var vendors = _.map(files.js.vendor, makeVendorPath.bind(null, 'dist'));

  return gulp.src(vendors)
    .pipe(gulp.dest('tmp/test/vendor'));
});

gulp.task('before-tests-data', function(cb) {
  var data = {};

  gulp.src('data/sample/**/*.json')
    .pipe(jsonToObject(data))
    .on('end', function() {
      var contents = 'window.data = ';
      contents = contents + util.inspect(data, {depth: null});
      contents = contents + ';';
      var dir = 'tmp/test';
      mkdirp.sync(dir);
      fs.writeFile(dir + '/data.js', contents, cb);
    });
});

gulp.task('before-tests-setup', function() {
  return gulp.src('test/lib/unitsetup.js')
    .pipe(browserify({
      debug: true
    }))
    .pipe(concat('setup.js'))
    .pipe(gulp.dest('tmp/test'));
});

gulp.task('before-tests-unit', function() {
  return gulp.src('test/unit/**/*.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(gulp.dest('tmp/test/unit'));
});

gulp.task('before-tests-index', function() {
  // NOTE: `expandFiles` expects files to be present at the given location
  // on the file system (uses "file exists" test), else it will return 
  // nothing for each file "not found"
  var testFiles = expandFiles(testem.serve_files);
  testFiles = _.map(testFiles, function(file) {
    return file.replace('tmp/test/', '');
  });

  return gulp.src('test/index.html')
    .pipe(template({
      files: testFiles
    }))
    .pipe(gulp.dest('tmp/test'));
});

gulp.task('before-tests', function(cb) {
  // IMPORTANT: 'before-tests-index' needs all test files to be built first
  runSequence(
    'clean-test',
    [
      'before-tests-mocha',
      'before-tests-vendor',
      'before-tests-data',
      'before-tests-setup',
      'before-tests-unit'
    ],
    'before-tests-index',
  cb);
});

gulp.task('default', ['build']);