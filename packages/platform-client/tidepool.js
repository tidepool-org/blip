// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var superagent = require('superagent');
var _ = require('lodash');

var makeClient = require('./index');

// Public-facing API, used by app developers
module.exports = function(options) {
  options = options || {};
  if (options.host == null) {
    options.host = 'https://api.tidepool.org';
  }
  if (options.uploadApi == null) {
    options.uploadApi = 'https://uploads.tidepool.org';
  }
  if (options.dataHost == null) {
    options.dataHost = 'https://data.tidepool.org';
  }

  var log = options.log;
  if (_.isEmpty(log)) {
    log = {
      warn: _.noop,
      info: _.noop,
      debug: _.noop,
    };
  }

  var localStore = options.localStore;
  if (localStore == null) {
    localStore = {
      getItem: _.noop,
      setItem: _.noop,
      removeItem: _.noop,
    };
  }

  return makeClient(_.omit(options, 'log', 'superagent', 'localStore'), {
    log,
    superagent,
    localStore,
  });
};

module.exports.client = makeClient;
