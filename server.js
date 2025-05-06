const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const crypto = require('node:crypto');

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
  if (!global.ssoHtml) {
    console.log('Caching static HTML');
    global.ssoHtml = fs.readFileSync(`${staticDir}/silent-check-sso.html`, 'utf8');
  }

  // Set a unique nonce for each request
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  res.locals.htmlWithNonces = global.html.replace(/<(script)/g, `<$1 nonce="${res.locals.nonce}"`);
  res.locals.ssoHtmlWithNonces = global.ssoHtml.replace(/<(script)/g, `<$1 nonce="${res.locals.nonce}"`);
  next();
}

app.use(helmet({ hsts: false, strictTransportSecurity: false }));

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
      (req) => {
        return req.hostname !== 'app.tidepool.org' && "'unsafe-eval'"; //required for Pendo.io Designer
      },
      (req) => {
        return req.hostname !== 'app.tidepool.org' && "'unsafe-inline'"; //required for Pendo.io Designer
      },
      'https://app.pendo.io',
      'https://pendo-io-static.storage.googleapis.com',
      'https://cdn.pendo.io',
      'https://pendo-static-5707274877534208.storage.googleapis.com',
      'https://data.pendo.io',
    ],
    styleSrc: [
      "'self'",
      'blob:',
      "'unsafe-inline'",
      'https://app.pendo.io',
      'https://cdn.pendo.io',
      'https://pendo-static-5707274877534208.storage.googleapis.com',
    ],
    imgSrc: [
      "'self'",
      'data:',
      'https://v2assets.zopim.io',
      'https://static.zdassets.com',
      'https://tidepoolsupport.zendesk.com',
      'https://support.tidepool.org',
      'https://cdn.pendo.io',
      'https://app.pendo.io',
      'https://pendo-static-5707274877534208.storage.googleapis.com',
      'https://data.pendo.io'
    ],
    fontSrc: ["'self'", 'data:'],
    reportUri: '/event/csp-report/violation',
    objectSrc: ['blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:', 'https://docs.google.com', 'https://app.pendo.io'],
    frameSrc: ['https://docs.google.com', 'https://app.pendo.io', 'https://*.tidepool.org', 'localhost:*', 'tidepooluploader://*'],
    connectSrc: [].concat([
      process.env.API_HOST || 'localhost:*',
      process.env.REALM_HOST,
      'https://api.github.com/repos/tidepool-org/uploader/releases',
      'https://static.zdassets.com',
      'https://ekr.zdassets.com',
      'https://tidepoolsupport.zendesk.com',
      'wss://tidepoolsupport.zendesk.com',
      'https://api.rollbar.com',
      'wss://*.zopim.com',
      'https://*.tidepool.org',
      'https://*.development.tidepool.org',
      'https://*.integration.tidepool.org',
      'https://*.integration-test.tidepool.org',
      'https://app.pendo.io',
      'https://data.pendo.io',
      'https://pendo-static-5707274877534208.storage.googleapis.com',
      'https://*.launchdarkly.com',
    ]).filter(src => src !== undefined),
    frameAncestors: [
      'https://app.pendo.io',
      'https://*.tidepool.org',
      'https://*.epic.com',
      'https://*.epichosted.com',
      'localhost:*'
    ]
  },
  reportOnly: false,
}));

app.use(bodyParser.json({
  type: ['json', 'application/csp-report'],
}));

app.get('/silent-check-sso.html', (req, res) => {
  res.send(res.locals.ssoHtmlWithNonces);
});

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
    console.log(`Serving static directory "${staticDir}/"`);
  });
}

if (config.httpsPort) {
  https.createServer(config.httpsConfig, app).listen(config.httpsPort, () => {
    console.log('Connect server started on HTTPS port', config.httpsPort);
    console.log(`Serving static directory "${staticDir}/"`);
  });
}

module.exports = app;
