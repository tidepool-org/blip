var http = require('http');
var connect = require('connect');

var buildDir = 'dist';

var app = connect();

app.use(connect.static(__dirname + '/' + buildDir));

http.createServer(app).listen(3000);
console.log('Connect server started on port 3000');
console.log('Serving static directory "' + buildDir + '/"'); 