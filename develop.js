var http = require('http');
var fs = require('fs');
var connect = require('connect');
var gulp = require('gulp');
var browserify = require('gulp-browserify');
var less = require('gulp-less');
var concat = require('gulp-concat');
var template = require('gulp-template');
var send = require('./lib/gulp-send');

var pkg = require('./package.json');
var files = require('./files');
process.env.DEMO_DIR = process.env.DEMO_DIR || 'demo/sample';
process.env.IMAGES_ENDPOINT = 'images';
process.env.DEMO_ENDPOINT = 'demo';

var app = connect();

app.use('/app.js', function(req, res, next) {
  res.setHeader('Content-Type', 'text/javascript');

  gulp.src('app/app.js')
    .pipe(browserify({
      transform: ['reactify'],
      debug: true
    }))
    .pipe(concat('app.js'))
    .pipe(send(res));
});

app.use('/start.js', function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  
  var stream = fs.createReadStream(__dirname + '/app/start.js');
  stream.pipe(res);
});

app.use('/config.js', function(req, res) {
  res.setHeader('Content-Type', 'text/javascript');
  
  gulp.src('app/config.js')
    .pipe(template({
      process: {env: process.env},
      pkg: pkg
    }))
    .pipe(send(res));
});

app.use('/bower_components', connect.static(__dirname + '/bower_components'));

app.use('/style.css', function(req, res, next) {
  res.setHeader('Content-Type', 'text/css');

  gulp.src('app/style.less')
    .pipe(less())
    .pipe(concat('style.css'))
    .pipe(send(res));
});

app.use('/fonts', connect.static(__dirname + '/app/core/fonts'));

files.images.forEach(function(image) {
  var endpoint = '/images/' + image.endpoint;
  var dir = __dirname + '/' + image.dir;
  app.use(endpoint, connect.static(dir));
});

app.use('/demo', connect.static(__dirname + '/' + process.env.DEMO_DIR));

app.use('/', function(req, res, next) {
  res.setHeader('Content-Type', 'text/html');

  gulp.src('app/index.html')
    .pipe(template({
      production: false,
      pkg: pkg,
      files: files
    }))
    .pipe(send(res));
});

app.use(connect.errorHandler());

http.createServer(app).listen(3000);
console.log('Connect server started on port 3000');