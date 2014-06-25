/* global rm */
require('shelljs/global');

var http = require('http');
var fs = require('fs');
var path = require('path');

var _ = require('lodash');
var connect = require('connect');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpack = require('webpack');
var serveStatic = require('serve-static');

var pkg = require('./package.json');
var webpackConfig = require('./webpack.config.js');
webpackConfig = _.assign(webpackConfig, {
  devtool: 'inline-source-map'
});
var webpackCompiler = webpack(webpackConfig);

rm('-f', 'example/bundle.js');

var app = connect();

app.use('/bower_components', serveStatic(path.join(__dirname, 'bower_components')));
app.use('/css', serveStatic(path.join(__dirname, 'css')));
app.use('/fonts', serveStatic(path.join(__dirname, 'fonts')));
app.use('/img', serveStatic(path.join(__dirname, 'img')));

var staticDir = path.join(__dirname, 'example');
app.use(serveStatic(staticDir));

app.use(webpackDevMiddleware(webpackCompiler, {
  stats: {colors: true}
}
));

app.use(connect.errorHandler());

var port = process.env.PORT || 8081;
http.createServer(app).listen(port);
console.log('Development server started on port', port);
console.log('Packing application. Please wait...');