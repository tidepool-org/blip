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

var _ = require('lodash');
var util = require('util');

var schema = require('./validator/schematron');

var schemas = {
  basal: require('./basal'),
  bolus: require('./bolus'),
  cbg: require('./bg'),
  common: require('./common'),
  deviceMeta: schema(),
  message: require('./message'),
  settings: require('./settings'),
  smbg: require('./bg'),
  wizard: require('./wizard')
};

module.exports = {
  validateOne: function(datum, result) {
    result = result || {valid: [], invalid: []};
    var handler = schemas[datum.type];
    if (handler == null) {
      datum.errorMessage = util.format('No schema defined for data.type[%s]', datum.type);
      console.log(new Error(datum.errorMessage), datum);
      result.invalid.push(datum);
    }
    else {
      try {
        handler(datum);
        result.valid.push(datum);
      }
      catch(e) {
        console.log('Oh noes! This is wrong:\n', datum);
        console.log(util.format('Error Message: %s%s', datum.type, e.message));
        datum.errorMessage = e.message;
        result.invalid.push(datum);
      }
    }
  },
  validateAll: function(data) {
    var result = {valid: [], invalid: []};
    for (var i = 0; i < data.length; ++i) {
      this.validateOne(data[i], result);
    }
    return result;
  }
};
