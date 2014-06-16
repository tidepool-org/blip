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

var app = connect();

app.use(webpackDevMiddleware(webpackCompiler, {
  stats: {colors: true}
}
));

app.use('/bower_components', serveStatic(path.join(__dirname, 'bower_components')));
app.use('/img', serveStatic(path.join(__dirname, 'img')));

var staticDir = path.join(__dirname, 'example');
app.use(serveStatic(staticDir));

app.use(connect.errorHandler());

var port = process.env.PORT || 8081;
http.createServer(app).listen(port);
console.log('Development server started on port', port);