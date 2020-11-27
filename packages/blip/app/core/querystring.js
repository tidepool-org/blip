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

var _ = require('lodash');
var Qs = require('qs');

// Thin wrapper around query string library
var queryString = {};

queryString.parse = function(qs) {
  // Allow '?foo=bar' as well as 'foo=bar'
  qs = qs.replace(/^\?/, '');
  return Qs.parse(qs);
};

queryString.stringify = Qs.stringify;

// More advanced parsing: convert some types
queryString.parseTypes = function(qs) {
  var parsed = this.parse(qs);
  _.forEach(parsed, function(value, key) {
    // Handle '?foo', '?foo=true' as Boolean true
    if (value === '' || value === 'true') {
      parsed[key] = true;
      return;
    }
    // Handle '?foo=false' as Boolean false
    if (value === 'false') {
      parsed[key] = false;
      return;
    }
    // Handle '?foo=null' as `null`
    if (value === 'null') {
      parsed[key] = null;
      return;
    }
    // Handle integers
    if (value.match(/^[0-9]+$/)) {
      parsed[key] = parseInt(value, 10);
      return;
    }
    // Handle floats
    if (value.match(/^[0-9.]+$/)) {
      parsed[key] = parseFloat(value);
      return;
    }
  });
  return parsed;
};

module.exports = queryString;
