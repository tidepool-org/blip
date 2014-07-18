/* 
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

var lib = {};

if (typeof window !== 'undefined') {
  lib._ = window._;
  lib.crossfilter = window.crossfilter;
  lib.d3 = window.d3;
  lib.Duration = window.Duration;
  lib.moment = window.moment;
  lib.bows = window.bows;
}
else {
  lib._ = require('lodash');
  lib.crossfilter = require('crossfilter');
  lib.d3 = require('d3');
  lib.Duration = require('duration-js');
  lib.moment = require('moment');
}

if (!lib._) {
  throw new Error('Underscore or Lodash is a required dependency!');
}

if (!lib.bows) {
  // NB: optional dependency
  // return a factory for a log function that does nothing
  lib.bows = function() {
    return function() {};
  };
}

module.exports = lib;