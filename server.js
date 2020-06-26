const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const compression = require('compression');
const crypto = require('crypto');
const morgan = require('morgan');
const package = require('./package.json');

const config = require('./config.server.js');

const buildDir = 'dist';
const staticDir = path.join(__dirname, buildDir);
let indexHTML = '<html></html>';
const fileList = [];

/**
 * Get the list of files we can serve
 */
function fetchFilesList() {
  const now = new Date().toISOString();
  console.log(`${now} Caching file list`);
  const files = fs.readdirSync(staticDir);
  Array.prototype.push.apply(fileList, files);
}

/**
 * Verify we have the requested file in stock
 * If we have, but with the wrong path, do a redirect
 * If not return the modified index.html
 * @param {Express.Request} req
 * @param {Express.Response} res
 * @param {(err?: any) => void} next
 */
function redirectMiddleware(req, res, next) {
  const reqURL = req.url;
  const file = path.basename(req.url);

  if (file === "index.html") {
    // Send the modified index.html
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.send(res.locals.htmlWithNonces);
    return;
  }

  if (fileList.includes(file)) {
    if (reqURL === `/${file}`) {
      // Serve the file with 'serve-static'
      return next();
    }
    // Do a redirect to the file -> can be in cache in the browser.
    return res.redirect(`/${file}`);
  }

  // Not found, send the modified index.html by default (no 404)
  res.setHeader('Cache-Control', 'public, max-age=0');
  res.send(res.locals.htmlWithNonces);
}

function nonceMiddleware(req, res, next) {
  // Set a unique nonce for each request
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  res.locals.htmlWithNonces = indexHTML.replace(/<(script)/g, `<$1 nonce="${res.locals.nonce}"`);
  next();
}

function printVersion() {
  const now = new Date().toISOString();
  console.log(`${now} ${package.name} v${package.version}`);
}

function cacheIndexHTML() {
  // Cache static html file to avoid reading it from the filesystem on each request
  const now = new Date().toISOString();
  console.log(`${now} Caching static HTML`);
  indexHTML = fs.readFileSync(`${staticDir}/index.html`, 'utf8');
}

const contentSecurityPolicy = {
  directives: {
    defaultSrc: ["'none'"],
    baseUri: ["'none'"],
    scriptSrc: [
      "'strict-dynamic'",
      "'unsafe-eval'",
      (req, res) => {
        return `'nonce-${res.locals.nonce}'`;
      },
      'https://d12wqas9hcki3z.cloudfront.net',
      'https://d33v4339jhl8k0.cloudfront.net',
    ],
    styleSrc: [
      "'self'",
      'blob:',
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://djtflbt20bdde.cloudfront.net',
    ],
    imgSrc: [
      "'self'",
      'data:',
    ],
    fontSrc: ["'self'", 'data:'],
    reportUri: '/event/csp-report/violation',
    objectSrc: ['blob:'],
    workerSrc: ["'self'", 'blob:'],
    childSrc: ["'self'", 'blob:', 'https://docs.google.com'],
    frameSrc: ['https://docs.google.com'],
    connectSrc: [
      config.apiHost,
      'https://api.github.com/repos/tidepool-org/chrome-uploader/releases',
      'https://static.zdassets.com',
      'https://ekr.zdassets.com',
      'https://diabeloop.zendesk.com',
      'https://d3hb14vkzrxvla.cloudfront.net',
      'wss\://*.pusher.com',
      '*.sumologic.com',
      'sentry.io',
    ],
  },
  reportOnly: false,
};

if (config.matomoUrl !== null) {
  contentSecurityPolicy.directives.imgSrc.push(config.matomoUrl);
  contentSecurityPolicy.directives.connectSrc.push(config.matomoUrl);
}

if (config.crowdinPreview) {
  contentSecurityPolicy.directives.imgSrc.push('https://crowdin-static.downloads.crowdin.com', 'https://cdn.crowdin.com');
  contentSecurityPolicy.directives.styleSrc.push('https://cdn.crowdin.com');
  contentSecurityPolicy.directives.connectSrc.push('https://cdn.crowdin.com');
  contentSecurityPolicy.directives.fontSrc.push('https://cdn.crowdin.com', 'https://fonts.gstatic.com');
  contentSecurityPolicy.directives.frameSrc.push('https://cdn.crowdin.com', 'https://crowdin.com');
}

printVersion();
cacheIndexHTML();
fetchFilesList();
const app = express();
app.use(morgan(':date[iso] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'));
app.use(compression());
app.use(helmet());
app.use(nonceMiddleware, helmet.contentSecurityPolicy(contentSecurityPolicy));
app.use(bodyParser.json({
  type: ['json', 'application/csp-report'],
}));
app.post('/event/csp-report/violation', (req, res) => {
  const now = new Date().toISOString();
  if (req.body) {
    console.log(`${now} CSP Violation:`, req.body);
  } else {
    console.log(`${now} CSP Violation: No data received!`);
  }
  res.status(204).end();
});
app.use(redirectMiddleware);
app.use(express.static(staticDir, {
  maxAge: '1d', // 1 day
  index: false,
}));


// If no ports specified, just start on default HTTP port
if (!(config.httpPort || config.httpsPort)) {
  config.httpPort = 3000;
}

if (config.httpPort) {
  app.server = http.createServer(app).listen(config.httpPort, () => {
    const now = new Date().toISOString();
    console.log(`${now} Connect server started on HTTP port`, config.httpPort);
    console.log(`${now} Serving static directory "${staticDir}/"`);
  });
}

if (config.httpsPort && config.httpsConfig) {
  https.createServer(config.httpsConfig, app).listen(config.httpsPort, () => {
    const now = new Date().toISOString();
    console.log(`${now} Connect server started on HTTP port`, config.httpPort);
    console.log(`${now} Serving static directory "${staticDir}/"`);
  });
}

module.exports = app;
