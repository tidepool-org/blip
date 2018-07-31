var http = require('http');
var https = require('https');
var path = require('path');
var express = require('express');
var helmet = require('helmet');
var bodyParser = require('body-parser')

var config = require('./config.server.js');

var buildDir = 'dist';

var app = express();

var whitelistedCSPDomains = [
  'https://app.tidepool.org',
  'https://dev-app.tidepool.org',
  'https://stg-app.tidepool.org',
  'https://int-app.tidepool.org',
];

if (process.env.CSP_DEBUG_HOST) {
  whitelistedCSPDomains.push(process.env.CSP_DEBUG_HOST);
}

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    scriptSrc: whitelistedCSPDomains,
    styleSrc: whitelistedCSPDomains.concat(["'unsafe-inline'"]),
    imgSrc: whitelistedCSPDomains.concat(['data:']),
    fontSrc: whitelistedCSPDomains.concat(['data:']),
    reportUri: '/event/csp-report/violation',
    objectSrc: ['blob:'],
    workerSrc: ['blob:'],
    connectSrc: [].concat([
      process.env.API_HOST,
      'https://api.github.com/repos/tidepool-org/chrome-uploader/releases',
    ]),
  },
  reportOnly: false,
}));

app.use(bodyParser.json({
  type: ['json', 'application/csp-report']
}))

var staticDir = path.join(__dirname, buildDir);
app.use(express.static(staticDir));


//So that we can use react-router and browser history
app.get('*', function (request, response){
  response.sendFile(staticDir + '/index.html');
});

app.post('/event/csp-report/violation', function (req, res) {
  if (req.body) {
    console.log('CSP Violation: ', req.body);
  } else {
    console.log('CSP Violation: No data received!');
  }
  res.status(204).end()
})

// If no ports specified, just start on default HTTP port
if (!(config.httpPort || config.httpsPort)) {
  config.httpPort = 3000;
}

if (config.httpPort) {
  app.server = http.createServer(app).listen(config.httpPort, function() {
    console.log('Connect server started on port', config.httpPort);
    console.log('Serving static directory "' + staticDir + '/"');
  });
}

if (config.httpsPort) {
  https.createServer(config.httpsConfig, app).listen(config.httpsPort, function() {
    console.log('Connect server started on HTTPS port', config.httpsPort);
    console.log('Serving static directory "' + staticDir + '/"');
  });
}

if (config.discovery && config.publishHost) {
  var hakken = require('hakken')(config.discovery).client();
  hakken.start();

  var serviceDescriptor = {service: config.serviceName};

  if (config.httpsPort) {
    serviceDescriptor.host = config.publishHost + ':' + config.httpsPort;
    serviceDescriptor.protocol = 'https';
  }
  else if (config.httpPort) {
    serviceDescriptor.host = config.publishHost + ':' + config.httpPort;
    serviceDescriptor.protocol = 'http';
  }

  console.log('Publishing to service discovery: ',serviceDescriptor);
  hakken.publish(serviceDescriptor);
}

module.exports = app;
