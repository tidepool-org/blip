const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const crypto = require('crypto');

const config = require('./config.server.js');

const buildDir = 'dist';
const staticDir = path.join(__dirname, buildDir);

const app = express();

const nonceMiddleware = (req, res, next) => {
  // Cache static html file to avoid reading it from the filesystem on each request
  if (!global.html) {
    console.log('Caching static HTML');
    global.html = fs.readFileSync(`${staticDir}/index.html`, 'utf8');
  }

  // Set a unique nonce for each request
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  res.locals.htmlWithNonces = global.html.replace(/<(script)/g, `<$1 nonce="${res.locals.nonce}"`);
  next();
}

app.use(helmet());

app.use(nonceMiddleware, helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'none'"],
    baseUri: ["'none'"],
    scriptSrc: [
      "'self'",
      "'strict-dynamic'",
      (req, res) => {
        return `'nonce-${res.locals.nonce}'`;
      },
      'https://static.zdassets.com',
      'https://ekr.zdassets.com',
      'https://tidepoolsupport.zendesk.com',
      'wss://tidepoolsupport.zendesk.com',
      'wss://*.zopim.com',
    ],
    styleSrc: [
      "'self'",
      'blob:',
      "'unsafe-inline'",
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://v2assets.zopim.io',
      'https://static.zdassets.com',
      'https://tidepoolsupport.zendesk.com',
    ],
    fontSrc: ["'self'", 'data:'],
    reportUri: '/event/csp-report/violation',
    objectSrc: ['blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:','https://docs.google.com'],
    frameSrc: ['https://docs.google.com'],
    connectSrc: [].concat([
      process.env.API_HOST || 'localhost',
      'https://api.github.com/repos/tidepool-org/chrome-uploader/releases',
      'https://static.zdassets.com',
      'https://ekr.zdassets.com',
      'https://tidepoolsupport.zendesk.com',
      'wss://tidepoolsupport.zendesk.com',
      'wss://*.zopim.com',
      '*.tidepool.org',
      '*.integration-test.tidepool.org',
      'http://*.integration-test.tidepool.org',
    ]),
  },
  reportOnly: false,
}));

app.use(bodyParser.json({
  type: ['json', 'application/csp-report'],
}));

app.use(express.static(staticDir, { index: false }));

//So that we can use react-router and browser history
app.get('*', (req, res) => {
  res.send(res.locals.htmlWithNonces);
});

app.post('/event/csp-report/violation', (req, res) => {
  if (req.body) {
    console.log('CSP Violation: ', req.body);
  } else {
    console.log('CSP Violation: No data received!');
  }
  res.status(204).end();
});

// If no ports specified, just start on default HTTP port
if (!(config.httpPort || config.httpsPort)) {
  config.httpPort = 3000;
}

if (config.httpPort) {
  app.server = http.createServer(app).listen(config.httpPort, () => {
    console.log('Connect server started on port', config.httpPort);
    console.log('Serving static directory "' + staticDir + '/"');
  });
}

if (config.httpsPort) {
  https.createServer(config.httpsConfig, app).listen(config.httpsPort, () => {
    console.log('Connect server started on HTTPS port', config.httpsPort);
    console.log('Serving static directory "' + staticDir + '/"');
  });
}

if (config.discovery && config.publishHost) {
  const hakken = require('hakken')(config.discovery).client();
  hakken.start();

  const serviceDescriptor = {service: config.serviceName};

  if (config.httpsPort) {
    serviceDescriptor.host = config.publishHost + ':' + config.httpsPort;
    serviceDescriptor.protocol = 'https';
  }
  else if (config.httpPort) {
    serviceDescriptor.host = config.publishHost + ':' + config.httpPort;
    serviceDescriptor.protocol = 'http';
  }

  console.log('Publishing to service discovery: ', serviceDescriptor);
  hakken.publish(serviceDescriptor);
}

module.exports = app;
