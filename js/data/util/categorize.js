/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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

 /* jshint esversion:6 */

var _ = require('lodash');
var { GLUCOSE_MM } = require('../../data/util/constants');

var Categorizer = function(bgClasses, bgUnits = 'mg/dL'){
  var classes = _.cloneDeep(bgClasses);
  var defaults = {
    'very-low': { boundary: 55 },
    low: { boundary: 70 },
    target: { boundary: 180 },
    high: { boundary: 300 },
  };

  if (bgUnits === 'mmol/L') {
    _.forOwn(defaults, function(value, key) {
      defaults[key].boundary = value.boundary/GLUCOSE_MM;
    });
  }

  _.defaults(classes, defaults);

  return function(d) {
    if (d.value < classes['very-low'].boundary) {
      return 'verylow';
    }
    else if (d.value >= classes['very-low'].boundary &&
      d.value < classes.low.boundary) {
      return 'low';
    }
    else if (d.value >= classes.low.boundary &&
      d.value <= classes.target.boundary) {
      return 'target';
    }
    else if (d.value > classes.target.boundary &&
      d.value <= classes.high.boundary) {
      return 'high';
    }
    else if (d.value > classes.high.boundary) {
      return 'veryhigh';
    }
  };
};

module.exports = Categorizer;
