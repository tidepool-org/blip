/**
 * CloudFront Lambda Edge - Blip Request Viewer
 * Version: {{ VERSION }}
 * Environnement: {{ TARGET_ENVIRONNEMENT }}
 * Date: {{ GEN_DATE }}
 */

const crypto = require('crypto');
const zlib = require('zlib');
const path = require('path');

exports.handler = async (event, context, callback) => {
  const basePath = '/';
  const blipFiles = [{{ DISTRIB_FILES }}];

  const { request } = event.Records[0].cf;

  let requestURI = path.normalize(`/${request.uri}`);
  const filename = path.basename(request.uri);

  if (filename.length > 0 && blipFiles.includes(filename)) {
    if (path.dirname(requestURI) !== basePath) {
      // Do a redirect for files:
      const response = {
        status: 302,
        statusDescription: 'Found',
        body: '',
        headers: {
          location: [{
            key: 'Location',
            value: `${basePath}${filename}`
          }],
        },
      };
      return callback(null, response);
    }
  } else {
    requestURI = basePath;
  }

  if (requestURI === basePath || requestURI === `${basePath}index.html`) {
    const nonce = crypto.randomBytes(16).toString('base64');
    const indexHTML = `{{ INDEX_HTML }}`;
    const buffer = zlib.gzipSync(indexHTML);
    const base64EncodedBody = buffer.toString('base64');

    const response = {
      status: 200,
      statusDescription: 'OK',
      headers: {
        'cache-control': [{ key: 'Cache-Control', value: 'no-store' }],
        'content-type': [{ key: 'Content-Type', value: 'text/html; charset=utf-8' }],
        'content-encoding' : [{ key: 'Content-Encoding', value: 'gzip' }],
        'content-security-policy': [{ key: 'Content-Security-Policy', value: `{{ CSP }}` }],
        'referrer-policy': [{ key: 'Referrer-Policy', value: 'no-referrer' }],
        'feature-policy': [{ key: 'Feature-Policy', value: "{{ FEATURE_POLICY }}" }],
        'strict-transport-security': [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }],
        'x-content-type-options': [{ key: 'X-Content-Type-Options', value: 'nosniff' }],
        'x-frame-options': [{ key: 'X-Frame-Options', value: 'DENY' }],
        'x-xss-protection': [{ key: 'X-XSS-Protection', value: '1; mode=block' }],
      },
      body: base64EncodedBody,
      bodyEncoding: 'base64',
    };
    return callback(null, response);

  } else if (requestURI === `${basePath}config.js`) {
    const configJS = `{{ CONFIG_JS }}`;
    const response = {
      status: 200,
      statusDescription: 'OK',
      headers: {
        'cache-control': [{ key: 'Cache-Control', value: 'max-age=3600' }],
        'content-type': [{ key: 'Content-Type', value: 'text/javascript; charset=utf-8' }],
        'strict-transport-security': [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }],
      },
      body: configJS
    };
    return callback(null, response);
  }

  // Process the request normally
  callback(null, request);
};
