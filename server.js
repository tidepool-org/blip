var http = require('http');
var connect = require('connect');

var buildDir = 'dist';

var app = connect();

var staticDir = __dirname + '/' + buildDir;
app.use(connect.static(staticDir));

var server = http.createServer(app).listen(process.env.PORT || 3000, function() {
  console.log('Connect server started on port', server.address().port);
  console.log('Serving static directory "' + staticDir + '/"'); 
});