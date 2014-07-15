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

var fs = require('fs');

function maybeReplaceWithContentsOfFile(obj, field) {
  var potentialFile = obj[field];
  if (potentialFile != null && fs.existsSync(potentialFile)) {
    obj[field] = fs.readFileSync(potentialFile).toString();
  }
}

var env = {};

env.httpPort = process.env.PORT;

env.httpsPort = process.env.HTTPS_PORT;

// The https config to pass along to https.createServer.
var theConfig = process.env.HTTPS_CONFIG;
env.httpsConfig = null;
if (theConfig) {
  env.httpsConfig = JSON.parse(theConfig);
  maybeReplaceWithContentsOfFile(env.httpsConfig, 'key');
  maybeReplaceWithContentsOfFile(env.httpsConfig, 'cert');
  maybeReplaceWithContentsOfFile(env.httpsConfig, 'pfx');
}

// Make sure we have an HTTPS config if a port is set
if (env.httpsPort && !env.httpsConfig) {
  throw new Error('No https config provided, please set HTTPS_CONFIG with at least the certificate to use.');
}

env.discoveryHost = process.env.DISCOVERY_HOST;

// The service name to expose to discovery
env.serviceName = process.env.SERVICE_NAME || 'blip';

// The local host to expose to discovery
env.publishHost = process.env.PUBLISH_HOST;

module.exports = env;
