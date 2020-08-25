
const crypto = require('crypto');
const util = require('util');
const zlib = require('zlib');
const chai = require('chai');
const lambda = require('./dist/cloudfront-test-blip-request-viewer');

describe('CloudFront Lambda Generator', function () {
  const { expect } = chai;
  /** @type {(string, object) => Promise<object>} */
  const handler = util.promisify(lambda.handler);

  const testBase = {
    'Records': [
      {
        'cf': {
          'config': {
            'distributionId': 'TESTS'
          },
          'request': {
            'uri': '/',
            'method': 'GET',
            'clientIp': '2001:cdba::3257:9652',
            'headers': {
              'host': [
                {
                  'key': 'Host',
                  'value': 'd123.cf.net'
                }
              ],
              'user-agent': [
                {
                  'key': 'User-Agent',
                  'value': 'Test Agent'
                }
              ],
              'user-name': [
                {
                  'key': 'User-Name',
                  'value': 'aws-cloudfront'
                }
              ]
            }
          }
        }
      }
    ]
  };

  let indexHTML = '';
  it('Should return the index.html in a gzip/base64 content', async () => {
    const gunzip = util.promisify(zlib.gunzip);
    const response = await handler(testBase, null);
    expect(response).to.be.an('object');
    expect(response.status).to.be.equal(200);
    expect(response.statusDescription).to.be.equal('OK');
    expect(response.bodyEncoding).to.be.equal('base64');
    expect(response.body).to.be.a('string');
    let b = Buffer.from(response.body, 'base64');
    b = await gunzip(b);
    indexHTML = b.toString('utf8');
    expect(indexHTML).to.be.a('string');
    expect(indexHTML.startsWith('<!DOCTYPE html>')).to.be.true;
  });

  it('Should return the index.html in a gzip/base64 content for others requested URL', async () => {
    testBase.Records[0].cf.request.uri = '/patients/abcd/data';
    const gunzip = util.promisify(zlib.gunzip);
    const response = await handler(testBase, null);
    expect(response).to.be.an('object');
    expect(response.status).to.be.equal(200);
    expect(response.statusDescription).to.be.equal('OK');
    expect(response.bodyEncoding).to.be.equal('base64');
    expect(response.body).to.be.a('string');
    let b = Buffer.from(response.body, 'base64');
    b = await gunzip(b);
    let html = b.toString('utf8');
    expect(html).to.be.a('string');
    expect(indexHTML.startsWith('<!DOCTYPE html>')).to.be.true;
    expect(html).to.be.not.equal(indexHTML); // nonce are differents
  });

  it('Should return the config.js', async () => {
    testBase.Records[0].cf.request.uri = '/config.js';
    const response = await handler(testBase, null);
    expect(response).to.be.an('object');
    expect(response.status).to.be.equal(200);
    expect(response.statusDescription).to.be.equal('OK');
    expect(response.body).to.be.a('string');
    expect(response.body.startsWith('window.config = {')).to.be.true;

    const hash = crypto.createHash('sha512');
    hash.update(response.body);
    const configHash = `sha512-${hash.digest('base64')}`;

    expect(indexHTML.indexOf(configHash)).to.be.above(0);
  });

  it('Should proceed the request to CloudFront for others requests', async () => {
    testBase.Records[0].cf.request.uri = '/favicon.ico';
    const response = await handler(testBase, null);
    expect(response).to.be.equal(testBase.Records[0].cf.request);
  });

  it('Should request a redirect for distributions files', async () => {
    testBase.Records[0].cf.request.uri = '/patients/favicon.ico';
    const response = await handler(testBase, null);
    expect(response).to.be.an('object');
    expect(response).to.be.deep.equal({
      status: 302,
      statusDescription: 'Found',
      body: '',
      headers: {
        location: [{
          key: 'Location',
          value: '/favicon.ico'
        }],
      },
    });
  });
});
