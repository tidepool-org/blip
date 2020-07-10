/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

const fs = require('fs');
const _ = require('lodash');

function maybeReplaceWithContentsOfFile(obj, field) {
  const potentialFile = _.get(obj, field, null);
  if (potentialFile !== null && fs.existsSync(potentialFile)) {
    obj[field] = fs.readFileSync(potentialFile).toString();
  }
}

const config = {
  httpPort: 3000,
  httpsPort: 3443,
  apiHost: 'http://localhost:8009',
  httpsConfig: null,
  metricsService: 'disabled',
  matomoUrl: null,
  crowdinPreview: false,
};

if (!_.isEmpty(process.env.PORT)) {
  config.httpPort = Number.parseInt(process.env.PORT, 10);
}
if (!_.isEmpty(process.env.HTTPS_PORT)) {
  config.httpsPort = Number.parseInt(process.env.HTTPS_PORT, 10);
}

// The https config to pass along to https.createServer.
const theConfig = process.env.HTTPS_CONFIG;
if (!_.isEmpty(theConfig)) {
  const httpsConfig = JSON.parse(theConfig);
  if (_.isEmpty(httpsConfig.key) || _.isEmpty(httpsConfig.cert)) {
    console.error('Wrong HTTPS config provided, please set HTTPS_CONFIG with at least the certificate to use.');
  } else {
    maybeReplaceWithContentsOfFile(httpsConfig, 'key');
    maybeReplaceWithContentsOfFile(httpsConfig, 'cert');
    maybeReplaceWithContentsOfFile(httpsConfig, 'pfx');
    config.httpsConfig = httpsConfig;
  }
}

// Make sure we have an HTTPS config if a port is set
if (config.httpsConfig === null) {
  console.info('No HTTPS config provided, HTTPS will be disabled');
} else {
  console.info(`HTTPS will be available on port ${config.httpsPort}`);
}

if (!_.isEmpty(process.env.API_HOST)) {
  config.apiHost = process.env.API_HOST
}

switch (_.get(process.env, 'METRICS_SERVICE', 'disabled')) {
case 'matomo':
  if (!_.isEmpty(process.env.MATOMO_TRACKER_URL) && process.env.MATOMO_TRACKER_URL.startsWith('http')) {
    config.matomoUrl = process.env.MATOMO_TRACKER_URL;
    config.metricsService = 'matomo';
  } else {
    console.error('Please set the MATOMO_TRACKER_URL to enable it');
  }
  break;
case 'highwater':
  config.metricsService = 'highwater';
  break;
case 'disabled':
  break;
default:
  console.error(`Unknown METRICS_SERVICE '${process.env.METRICS_SERVICE}`);
}

if (process.env.CROWDIN === 'enabled') {
  config.crowdinPreview = true;
}

module.exports = config;
