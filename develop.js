var http = require('http');
var fs = require('fs');
var util = require('util');
var path = require('path');
var _ = require('lodash');
var connect = require('connect');
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var template = require('gulp-template');
var send = require('./lib/gulp-send');
var jsonToObject = require('./lib/gulp-json2obj');

var pkg = require('./package.json');
var files = require('./files');
process.env.MOCK_DATA_DIR = process.env.MOCK_DATA_DIR || 'data/sample';
process.env.IMAGES_ENDPOINT = 'images';
var ROOT = __dirname;

var app = connect();

app.use('/app.js', function(req, res, next) {
  res.setHeader('Content-Type', 'text/javascript');

  gulp.src(path.join(ROOT, 'app/app.js'))
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    // Error handling: can't just pass `next`,
    // need to explicitly give it a function
    .on('error', function(err) {
      next(err);
    })
    .pipe(concat('app.js'))
    .pipe(send(res));
});

app.use('/start.js', function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  
  var stream = fs.createReadStream(__dirname + '/app/start.js');
  stream.pipe(res);
});

app.use('/tidepoolplatform.js', function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');

  var stream = fs.createReadStream(__dirname + '/app/tidepoolplatform.js');
  stream.pipe(res);
});

app.use('/config.js', function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');

  gulp.src(path.join(ROOT, 'app/config.js'))
    .pipe(template({
      process: {env: process.env},
      pkg: pkg
    }))
    .on('error', function(err) {
      next(err);
    })
    .pipe(send(res));
});

app.use('/mock.js', function(req, res, next) {
  res.setHeader('Content-Type', 'text/javascript');

  gulp.src(path.join(ROOT, 'mock/index.js'))
    .pipe(browserify({
      debug: true
    }))
    .on('error', function(err) {
      next(err);
    })
    .pipe(concat('mock.js'))
    .pipe(send(res));
});

app.use('/data.js', function(req, res, next) {
  res.setHeader('Content-Type', 'text/javascript');

  var data = {};

  gulp.src(process.env.MOCK_DATA_DIR + '/**/*.json')
    .pipe(jsonToObject(data))
    .on('end', function() {
      var contents = 'window.data = ';
      contents = contents + util.inspect(data, {depth: null});
      contents = contents + ';';
      res.end(contents);
    });
});

app.use('/bower_components', connect.static(__dirname + '/bower_components'));

app.use('/style.css', function(req, res, next) {
  res.setHeader('Content-Type', 'text/css');

  gulp.src(path.join(ROOT, 'app/style.less'))
    .pipe(less())
    .on('error', function(err) {
      next(err);
    })
    .pipe(concat('style.css'))
    .pipe(send(res));
});

app.use('/fonts', connect.static(__dirname + '/app/core/fonts'));

var imagesAndSvg = files.images.concat(files.svg);
imagesAndSvg.forEach(function(image) {
  var endpoint = '/images/' + image.endpoint;
  var dir = __dirname + '/' + image.dir;
  app.use(endpoint, connect.static(dir));
});

var vendors = _.map(files.js.vendor, function(vendor) {
  return vendor.dir + '/' + vendor.dist;
});

app.use('/', function(req, res, next) {
  if (!(req.url === '/' || req.url.match(/^\/\?/))) {
    return next();
  }

  res.setHeader('Content-Type', 'text/html');

  gulp.src(path.join(ROOT, 'app/index.html'))
    .pipe(template({
      production: false,
      pkg: pkg,
      vendors: vendors,
      mock: process.env.MOCK
    }))
    .on('error', function(err) {
      next(err);
    })
    .pipe(send(res));
});

app.use(function(req, res, next) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('Not found');
});

app.use(connect.errorHandler());

var server = http.createServer(app).listen(process.env.PORT || 3000, function listening ( ) {
  console.log('Connect server started on port', server.address( ).port);
});
