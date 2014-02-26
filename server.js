var http = require('http');
var connect = require('connect');

var gulp = require('gulp');
var path = require('path');
var pkg = require('./package.json');
var send = require('./lib/gulp-send');
var template = require('gulp-template');

var buildDir = 'dist';
var ROOT = __dirname;

var app = connect();

var staticDir = __dirname + '/' + buildDir;

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

app.use(connect.static(staticDir));

var server = http.createServer(app).listen(process.env.PORT || 3000, function() {
  console.log('Connect server started on port', server.address().port);
  console.log('Serving static directory "' + staticDir + '/"'); 
});