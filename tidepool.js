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

var superagent = window.superagent;
var _ = window._;

var makeClient = require('./index');

// Public-facing API, used by app developers
module.exports = function(options) {
  options = options || {};
  if (options.host == null) {
    options.host = 'https://api.tidepool.io';
  }
  if (options.uploadApi == null) {
    options.uploadApi = 'https://uploads.tidepool.io';
  }


  var log = options.log;
  if (log == null) {
    log = {
      warn: function(){},
      info: function(){},
      debug: function(){}
    };
  }

  var localStore = options.localStore;
  if (localStore == null) {
    localStore = {
      getItem: function() {},
      setItem: function() {},
      removeItem: function() {}
    };
  }

  return makeClient(_.omit(options, 'log', 'superagent', 'localStore'), {
    log: log,
    superagent: superagent,
    localStore: localStore
  });
};

module.exports.client = makeClient;
