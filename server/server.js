/* eslint-disable lodash/prefer-lodash-typecheck */
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const compression = require('compression');
const morgan = require('morgan');
const request = require('request');

let httpPort = 3000;
let httpsPort = 3002;

/** @type {string[]} */
const fileList = [];
/** @type {http.Server} */
let httpServer = null;
/** @type {https.Server} */
let httpsServer = null;
let lambdaUrl = 'http://localhost:9001';

// If ports specified override the default value (3000)
if (process.env.PORT !== undefined && process.env.PORT !== '') {
  httpPort = Number.parseInt(process.env.PORT, 10);
}

// If ports specified override the default value (3002)
if (process.env.HTTPS_PORT !== undefined && process.env.HTTPS_PORT !== '') {
  httpsPort = Number.parseInt(process.env.HTTPS_PORT, 10);
}

if (process.env.LAMBDA_URL !== undefined && process.env.LAMBDA_URL !== '') {
  lambdaUrl = process.env.LAMBDA_URL;
}

function getStaticDir(defaultDir) {
  let dir = null;
  if (process.argv.length === 3) {
    dir = path.resolve(process.argv[2]);
  } else {
    dir = path.resolve(defaultDir);
  }
  console.info(`Serving from: '${dir}'`);
  return dir;
}

/**
 * Get the list of files we can serve
 */
function fetchFilesList(dir) {
  const now = new Date().toISOString();
  console.log(`${now} Caching file list`);
  const files = fs.readdirSync(dir);
  Array.prototype.push.apply(fileList, files);
}

/**
 * Verify we have the requested file in stock
 * If we have, but with the wrong path, do a redirect
 * If not return the modified index.html
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {(err?: any) => void} next
 */
function redirectMiddleware(req, res, next) {
  const reqURL = req.url;
  const payload = {
    'Records': [
      {
        'cf': {
          'request': {
            'uri': reqURL
          }
        }
      }
    ]
  };
  const options = {
    method: 'POST',
    url: `${lambdaUrl}/2015-03-31/functions/func/invocations`,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
  request(options, (error, response) => {
      if (error) {
        console.error(error);
        res.status(500).send('lambda middleware issue');
        next(error);
      } else {
        const resBody = JSON.parse(response.body);
        if (resBody.status !== undefined) {
          // set headers
          for (const hd in resBody.headers) {
            res.header(hd, resBody.headers[hd][0].value);
          }
          // set body
          if (resBody.bodyEncoding === 'base64') {
            const b = Buffer.from(resBody.body, 'base64');
            res.status(resBody.status).send(b);
          } else {
            res.status(resBody.status).send(resBody.body);
          }
        } else {
          return next();
        }
      }
  });
}

/**
 *
 * @param {express.Express} app
 */
async function stopServer(app) {
  console.log('Stopping http server...');
  if (httpServer !== null) {
    httpServer.close();
    httpServer.removeAllListeners();
    httpServer = null;
  }

  console.log('Stopping https server...');
  if (httpsServer !== null) {
    httpsServer.close();
    httpsServer.removeAllListeners();
    httpsServer = null;
  }

  if (app !== null) {
    app.removeAllListeners();
  }
}

const staticDir = getStaticDir(`${__dirname}/../dist/static`);

fetchFilesList(staticDir);
const app = express();
app.use(morgan(':date[iso] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]'));
app.use(compression());
app.use(helmet());
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

if (httpPort) {
  httpServer = http.createServer(app).listen(httpPort, () => {
    const now = new Date().toISOString();
    console.log(`${now} Connect server started on HTTP port`, httpPort);
    console.log(`${now} Serving static directory '${staticDir}/'`);
  });
}

if (httpsPort) {
  fs.access("/dist/server/blip.cert", fs.F_OK, (err) => {
    if (err) {
      console.warn("Certificate is missing, https server not starting");
    }
    else {
      httpsServer = https.createServer({
        key: fs.readFileSync('/dist/server/blip.key'),
        cert: fs.readFileSync('/dist/server/blip.cert')
      }, app)
      .listen(httpsPort, () => {
        const now = new Date().toISOString();
        console.log(`${now} Connect server started on HTTPS port`, httpsPort);
        console.log(`${now} Serving static directory '${staticDir}/'`);
      })
    }
  })
}

// Handle simple process kill
process.once('SIGTERM', async () => {
  await stopServer(app);
});

// Handle Ctrl+C when launch in a console
process.once('SIGINT', async () => {
  await stopServer(app);
});

module.exports = app;
